import { NextFunction, Request, Response } from "express";
export declare class UserController {
    static me(request: Request, response: Response, next: NextFunction): Promise<void>;
    static updateMe(request: Request, response: Response, next: NextFunction): Promise<void>;
    static updateMeImage(request: Request, response: Response, next: NextFunction): Promise<void>;
    static storePaymentToPaymentHistory(request: Request, response: Response, next: NextFunction): Promise<void>;
    static getProfessionalPaymentHistory(request: Request, response: Response, next: NextFunction): Promise<void>;
    static verifyCurrentPasswordMatch(request: Request, response: Response, next: NextFunction): Promise<void>;
    static changeProfessionalPassword(request: Request, response: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=controller.d.ts.map