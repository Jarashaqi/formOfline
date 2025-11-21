// Simple auth utility functions
export const getStoredUser = () => {
    return localStorage.getItem('selectedUser')
  }
  
  export const setStoredUser = (userName) => {
    localStorage.setItem('selectedUser', userName)
  }
  
  export const clearStoredUser = () => {
    localStorage.removeItem('selectedUser')
  }
  
  export const isAuthenticated = () => {
    return !!getStoredUser()
  }