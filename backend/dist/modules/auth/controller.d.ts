import { Request, Response, NextFunction } from "express";
export declare class AuthController {
    static register(request: Request, response: Response, next: NextFunction): Promise<void>;
    static login(request: Request, response: Response, next: NextFunction): Promise<void>;
    static refresh(request: Request, response: Response, next: NextFunction): Promise<void>;
    static logout(request: Request, response: Response, next: NextFunction): Promise<void>;
    static requestEmailVerification(request: Request, response: Response, next: NextFunction): Promise<void>;
    static verifyEmail(request: Request, response: Response, next: NextFunction): Promise<void>;
    static requestPasswordReset(request: Request, response: Response, next: NextFunction): Promise<void>;
    static verifyResetCode(request: Request, response: Response, next: NextFunction): Promise<void>;
    static resetPassword(request: Request, response: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=controller.d.ts.map