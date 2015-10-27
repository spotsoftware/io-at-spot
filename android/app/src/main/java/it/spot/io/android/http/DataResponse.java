package it.spot.io.android.http;

/**
 * Created by andreacorzani on 03/11/14.
 */
public class DataResponse<T> extends BaseResponse implements IDataResponse<T> {

    private T mData;

    public DataResponse(T data){
        super();
        this.mData = data;
    }

    public DataResponse(){
        this.mData = null;
    }

    @Override
    public T getData() {
        return this.mData;
    }
}
