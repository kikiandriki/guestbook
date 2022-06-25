declare global {
  namespace Express {
    export interface Request {
      actor: {
        sub: string
        id: string
        permissions: string[]
        system: boolean
      }
    }
  }
}

export {}
