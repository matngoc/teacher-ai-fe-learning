import {RolesService} from "../../api/services/RolesService.ts";

export const useSelectRole = async () => {
    const res = await RolesService.dataSelect();
    return (res);
};