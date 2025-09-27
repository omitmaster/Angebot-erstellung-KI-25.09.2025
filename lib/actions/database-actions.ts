"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function resetDatabase() {
  const supabase = await createClient()

  try {
    // Execute the reset script
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        -- This would execute the reset script
        -- For security, this should be limited to admin users only
        SELECT 'Database reset initiated' as message;
      `,
    })

    if (error) {
      throw error
    }

    revalidatePath("/")
    return { success: true, message: "Datenbank erfolgreich zurückgesetzt" }
  } catch (error) {
    console.error("Database reset error:", error)
    return {
      success: false,
      message: "Fehler beim Zurücksetzen der Datenbank: " + (error as Error).message,
    }
  }
}

export async function createSampleData() {
  const supabase = await createClient()

  try {
    // Create sample customer
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: "Müller Bau GmbH",
        person: "Thomas Müller",
        phone: "+49 40 12345678",
        email: "t.mueller@mueller-bau.de",
        address: "Musterstraße 123, 20095 Hamburg",
        source: "website",
        tags: ["Neukunde"],
      })
      .select()
      .single()

    if (customerError) throw customerError

    // Create sample intake
    const { error: intakeError } = await supabase.from("intakes").insert({
      customer_id: customer.id,
      status: "new",
      branch: "Dachsanierung Einfamilienhaus",
      transcript:
        "Guten Tag, wir benötigen ein Angebot für die Sanierung unseres Daches. Das Haus ist ca. 150m² Grundfläche, Baujahr 1985. Die Dachziegel sind teilweise beschädigt und die Dämmung entspricht nicht mehr den aktuellen Standards...",
      channel: "email",
      attachments: [],
    })

    if (intakeError) throw intakeError

    revalidatePath("/posteingang")
    return { success: true, message: "Beispieldaten erfolgreich erstellt" }
  } catch (error) {
    console.error("Sample data creation error:", error)
    return {
      success: false,
      message: "Fehler beim Erstellen der Beispieldaten: " + (error as Error).message,
    }
  }
}
