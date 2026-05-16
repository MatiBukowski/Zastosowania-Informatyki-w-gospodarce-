export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  token_type: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
}

export interface IRegisterResponse {
  access_token: string;
  token_type: string;
}