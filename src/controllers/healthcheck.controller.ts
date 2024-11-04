import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, "OK", {}));
});

export { healthcheck };
