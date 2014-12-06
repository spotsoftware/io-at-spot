package it.spot.io.doorkeeper.http;

/**
 * Created by andreacorzani on 03/11/14.
 */
public interface IDataResponse<T> extends IBaseResponse {
    public T getData();
}
