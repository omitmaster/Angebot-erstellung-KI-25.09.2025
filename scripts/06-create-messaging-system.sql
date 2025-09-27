-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  handwerker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, customer_id, handwerker_id) -- One conversation per job between specific customer and handwerker
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  attachment_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message read status table
CREATE TABLE IF NOT EXISTS public.message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.conversation_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Users can access conversations they are part of
CREATE POLICY "conversations_participant_access" ON public.conversations 
  FOR ALL USING (
    auth.uid() = customer_id OR auth.uid() = handwerker_id
  );

-- RLS Policies for messages
-- Users can access messages in conversations they are part of
CREATE POLICY "messages_participant_access" ON public.conversation_messages 
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE customer_id = auth.uid() OR handwerker_id = auth.uid()
    )
  );

-- Users can send messages in conversations they are part of
CREATE POLICY "messages_participant_insert" ON public.conversation_messages 
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE customer_id = auth.uid() OR handwerker_id = auth.uid()
    )
  );

-- Users can update their own messages
CREATE POLICY "messages_sender_update" ON public.conversation_messages 
  FOR UPDATE USING (sender_id = auth.uid());

-- RLS Policies for message read status
CREATE POLICY "message_read_status_own" ON public.message_read_status 
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_handwerker_id ON public.conversations(handwerker_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON public.conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender_id ON public.conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON public.conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON public.message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON public.message_read_status(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversation_messages_updated_at BEFORE UPDATE ON public.conversation_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update conversation last_message_at when new message is added
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Trigger to update conversation when new message is added
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Function to create or get conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_job_id UUID,
  p_customer_id UUID,
  p_handwerker_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE job_id = p_job_id 
    AND customer_id = p_customer_id 
    AND handwerker_id = p_handwerker_id;
  
  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (job_id, customer_id, handwerker_id)
    VALUES (p_job_id, p_customer_id, p_handwerker_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Function to get unread message count for user
CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM public.conversation_messages cm
  JOIN public.conversations c ON cm.conversation_id = c.id
  WHERE (c.customer_id = user_id OR c.handwerker_id = user_id)
    AND cm.sender_id != user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_read_status mrs 
      WHERE mrs.message_id = cm.id AND mrs.user_id = user_id
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.message_read_status (message_id, user_id)
  SELECT cm.id, p_user_id
  FROM public.conversation_messages cm
  WHERE cm.conversation_id = p_conversation_id
    AND cm.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_read_status mrs 
      WHERE mrs.message_id = cm.id AND mrs.user_id = p_user_id
    );
END;
$$;
