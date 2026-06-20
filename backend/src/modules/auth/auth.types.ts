/**
 * Data Transfer Object for login requests.
 */
export interface LoginDto {
  /** User email address */
  email: string;
  /** Plain text password */
  password: string;
  /** Remember me flag, optional */
  rememberMe?: boolean;
}

/**
 * JWT payload structure used for both access and refresh tokens.
 */
export interface JwtPayload {
  /** Subject - user ID */
  sub: string;
  /** User email */
  email: string;
  /** User role */
  role: string;
  /** Issued At timestamp */
  iat?: number;
  /** Expiration timestamp */
  exp?: number;
}

/**
 * Response returned after successful authentication.
 */
export interface AuthResponse {
  /** Access token string (JWT) */
  accessToken: string;
  /** Refresh token string (JWT) */
  refreshToken: string;
  /** Authenticated user details */
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

/**
 * DTO for token refresh requests.
 */
export interface RefreshDto {
  /** Refresh token provided by client */
  refreshToken: string;
}


