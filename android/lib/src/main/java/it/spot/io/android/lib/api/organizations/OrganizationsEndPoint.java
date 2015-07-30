package it.spot.io.android.lib.api.organizations;

import java.util.List;

import retrofit.Callback;
import retrofit.http.GET;
import retrofit.http.Path;

/**
 * @author a.rinaldi
 */
public interface OrganizationsEndPoint {

    @GET("/api/organizations")
    void get(Callback<List<Organization>> callback);

    @GET("/api/organizations/{id}")
    void get(@Path("id") String organizationId, Callback<Organization> callback);
}
