import { Request, Response, NextFunction } from "express";
export declare function registerController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function loginController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function refreshController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function logoutController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function requestEmailVerificationController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function verifyEmailController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function requestPasswordResetController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function verifyResetCodeController(request: Request, response: Response, next: NextFunction): Promise<void>;
export declare function resetPasswordController(request: Request, response: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=controller.d.ts.map