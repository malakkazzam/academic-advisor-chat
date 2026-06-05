// src/hooks/useAuth.js
import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore()
  return { user, token, isAuthenticated, setAuth, logout, updateUser }
}