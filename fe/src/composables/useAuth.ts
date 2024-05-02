import { readonly, ref } from 'vue'

interface Auth {
  authCode: string | null
  accessToken: string | null
  idToken: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  userName: string | null
  userEmail: string | null
}

const stateAuth = ref<Auth>({
  authCode: null,
  accessToken: null,
  idToken: null,
  refreshToken: null,
  isLoggedIn: false,
  userName: null,
  userEmail: null
})

/**
 * holds all auth related functionalities
 * authentication is based on aws cognito (oauth 2.0)
 */
export const useAuth = () => {
  /**
   * init authentication process - open the login page
   */
  const initAuth = () => {
    if (hasAuthSession()) {
      return
    }
    sessionStorage.setItem('session', 'in progress')
    openLoginPage()
  }

  /**
   * checks if there is already a auth session in progress
   * @returns if there is a entry in session store
   */
  const hasAuthSession = () => {
    return !!sessionStorage.getItem('session')
  }

  /**
   * open the login page (cognito hosted ui)
   * 1st step of the auth process
   * when a user authenticates successfully, he is redirected back to the app with the authorization code
   */
  const openLoginPage = () => {
    const baseUrl = `${import.meta.env.VITE_APP_COGNITO_DOMAIN}/oauth2/authorize`
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_APP_COGNITO_CLIENT_ID,
      response_type: 'code',
      scope: 'email openid',
      redirect_uri: import.meta.env.VITE_APP_COGNITO_REDIRECT_URI
    })
    const url = new URL(baseUrl)
    url.search = params.toString()

    try {
      window.location.href = url.toString()
    } catch (error) {
      console.log('openLoginPage failed:', error)
    }
  }

  /**
   * get jwt tokens from cognito
   * 2nd step of the auth process
   * after successful authentication, the user is redirected back to app and the auth code is appended to the url
   * this code is needed for getting the jwt tokens from cognito
   * @param authCode is the code needed to send to cognito
   */
  const getAuthTokens = async (authCode: string) => {
    const baseUrl = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/${import.meta.env.VITE_APP_API_GATEWAY_STAGE}/auth`
    const params = new URLSearchParams({
      code: authCode
    })
    const url = new URL(baseUrl)
    url.search = params.toString()

    try {
      const response = await fetch(url)

      if (response.ok) {
        const json = await response.json()
        const accessToken = json?.access_token
        const idToken = json?.id_token
        const refreshToken = json?.refresh_token

        if (accessToken && idToken && refreshToken) {
          setAccessToken(accessToken)
          setIdToken(idToken)
          setRefreshToken(refreshToken)

          return { accessToken, idToken, refreshToken }
        }
      }
    } catch (error) {
      console.log('getAuthTokens failed:', error)
    }
  }

  /**
   * get the user data encoded in the access token from cognito
   * @param accessToken contais the user info to decode
   */
  const getUserInfo = async (accessToken: string) => {
    const url = `${import.meta.env.VITE_APP_COGNITO_DOMAIN}/oauth2/userInfo`

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (response.ok) {
        const json = await response.json()
        const email = json?.email
        const userName = json?.username

        if (email && userName) {
          setUserInfo(email, userName)
          setIsLoggedIn(true)
        }
      }
    } catch (error) {
      console.log('getUserInfo failed:', error)
    }
  }

  /**
   * setter for the stateAuth
   * @param authCode
   */
  const setAuthCode = (authCode: string | null) => {
    if (authCode) {
      stateAuth.value.authCode = authCode
    } else {
      stateAuth.value.authCode = null
    }
  }

  /**
   * setter for the stateAuth
   * @param accessToken
   */
  const setAccessToken = (accessToken: string | null) => {
    if (accessToken) {
      stateAuth.value.accessToken = accessToken
    } else {
      stateAuth.value.accessToken = null
    }
  }

  /**
   * setter for the stateAuth
   * @param idToken
   */
  const setIdToken = (idToken: string | null) => {
    if (idToken) {
      stateAuth.value.idToken = idToken
    } else {
      stateAuth.value.idToken = null
    }
  }

  /**
   * setter for the stateAuth
   * @param refreshToken
   */
  const setRefreshToken = (refreshToken: string | null) => {
    if (refreshToken) {
      stateAuth.value.refreshToken = refreshToken
    } else {
      stateAuth.value.refreshToken = null
    }
  }

  /**
   * setter for the stateAuth
   * @param email
   * @param userName
   */
  const setUserInfo = (email: string | null, userName: string | null) => {
    if (email && userName) {
      stateAuth.value.userEmail = email
      stateAuth.value.userName = userName
    } else {
      stateAuth.value.userEmail = null
      stateAuth.value.userName = null
    }
  }

  /**
   * setter for the stateAuth
   * @param isLoggedIn
   */
  const setIsLoggedIn = (isLoggedIn: boolean) => {
    stateAuth.value.isLoggedIn = isLoggedIn
  }

  /**
   * logs the user out
   * redirects to cognito logout endpoint and clears all user data from state
   */
  const logout = async () => {
    const baseUrl = `${import.meta.env.VITE_APP_COGNITO_DOMAIN}/logout`
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_APP_COGNITO_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_APP_COGNITO_REDIRECT_URI,
      response_type: 'code'
    })
    const url = new URL(baseUrl)
    url.search = params.toString()

    try {
      window.location.href = url.toString()
      resetAuth()
    } catch (error) {
      console.log('logout failed:', error)
    }
  }

  /**
   * clears the state and the session storage
   */
  const resetAuth = async () => {
    setAccessToken(null)
    setIdToken(null)
    setRefreshToken(null)
    setIsLoggedIn(false)
    setUserInfo(null, null)
    sessionStorage.clear()
  }

  return {
    initAuth,
    hasAuthSession,
    setAuthCode,
    getAuthTokens,
    getUserInfo,
    logout,
    resetAuth,
    stateAuth: readonly(stateAuth)
  }
}
