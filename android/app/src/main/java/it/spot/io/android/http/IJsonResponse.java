package it.spot.io.android.http;

import org.json.JSONObject;

/**
 * Created by andreacorzani on 03/11/14.
 */
public interface IJsonResponse extends IBaseResponse {
    public JSONObject getJSON();
}
