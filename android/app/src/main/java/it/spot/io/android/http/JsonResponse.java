package it.spot.io.android.http;

import org.json.JSONObject;

/**
 * Created by andreacorzani on 03/11/14.
 */
public class JsonResponse extends BaseResponse implements IJsonResponse {

    private JSONObject mData;

    public JsonResponse(JSONObject data){
        super();
        this.mData = data;
    }

    public JsonResponse(){
        super();
    }

    @Override
    public JSONObject getJSON() {
        return this.mData;
    }
}
