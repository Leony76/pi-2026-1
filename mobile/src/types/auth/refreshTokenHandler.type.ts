export type RefreshTokenHandler = (
  newToken        : string, 
  newRefreshToken : string
) => Promise<void>;