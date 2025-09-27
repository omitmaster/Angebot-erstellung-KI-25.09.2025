interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new ApiError(data.error || `HTTP ${response.status}`, response.status, data)
      }

      return data.data || (data as T)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network or parsing error
      throw new ApiError("Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.", 0)
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint

    return this.request<T>(url, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
export { ApiError }

// Typed API methods
export const api = {
  // Auth
  register: (data: any) => apiClient.post("/auth/register", data),

  // Profiles
  getProfile: () => apiClient.get("/profiles"),
  updateProfile: (data: any) => apiClient.put("/profiles", data),

  // Projects
  getProjects: (params?: Record<string, string>) => apiClient.get("/projects", params),
  createProject: (data: any) => apiClient.post("/projects", data),

  // Add more API methods as needed
}
