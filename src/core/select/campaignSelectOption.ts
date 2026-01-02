import {CampaignsService} from "../../api/services/CampaignsService.ts";

export const useSelectCampaign = async () => {
    const res = await CampaignsService.dataSelect();
    return (res);
};