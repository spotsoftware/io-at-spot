package it.spot.io.lib.api.workTimeEntries;

import java.util.List;
import java.util.Map;

import retrofit.http.Body;
import retrofit.http.DELETE;
import retrofit.http.GET;
import retrofit.http.POST;
import retrofit.http.PUT;
import retrofit.http.Path;
import retrofit.http.QueryMap;

/**
 * @author a.rinaldi
 */
public interface WorkTimeEntriesInterface {

    @GET("/api/organizations/{orgId}/workTimeEntries")
    List<WorkTimeEntry> get(@Path("orgId") String orgId, @QueryMap Map<String, String> filters);

    @GET("/api/organizations/{orgId}/workTimeEntries/{id}")
    WorkTimeEntry get(@Path("orgId") String orgId, @Path("id") String id);

    @POST("/api/organizations/{orgId}/workTimeEntries")
    WorkTimeEntry create(@Path("orgId") String orgId, @Body WorkTimeEntry entity);

    @PUT("/api/organizations/{orgId}/workTimeEntries/{id}")
    WorkTimeEntry edit(@Path("orgId") String orgId, @Path("id") String id, @Body WorkTimeEntry entity);

    @DELETE("/api/organizations/{orgId}/workTimeEntries/{id}")
    boolean delete(@Path("orgId") String orgId, @Path("id") String id);
}
