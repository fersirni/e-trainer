import { Error } from "../generated/graphql";

export const toErrorMap = (errors: Error[]) => {
    const errorMap: Record<string, string> = {};
    errors.forEach(({ key, entity, field, message}) => {
        if (field) {
            errorMap[field] = message;
        } else if (key) {
            errorMap[key] = message;
        } else if (entity) {
            errorMap[entity] = message;
        }

    });
    return errorMap;
    
}