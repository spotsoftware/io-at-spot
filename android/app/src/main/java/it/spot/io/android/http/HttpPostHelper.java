package it.spot.io.android.http;

import android.os.AsyncTask;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;

/**
 * Created by andreacorzani on 19/10/14.
 */
public class HttpPostHelper {

    /**
     * Read all HTML or text from the input stream using the specified text encoding
     *
     * @param input    The stream to read text from
     * @param encoding The encoding of the stream
     * @return All text read from the stream
     */
    private static String readAll(InputStream input, String encoding) {
        try {
            InputStreamReader reader = new InputStreamReader(input, encoding);
            StringBuilder result = new StringBuilder();
            char[] buffer = new char[4096];
            int len;
            while ((len = reader.read(buffer, 0, buffer.length)) > 0) {
                result.append(buffer, 0, len);
            }
            reader.close();
            return result.toString();
        } catch (IOException ignored) {
        }
        return null;
    }

    /**
     * Find out and return what type of text encoding is specified by the server
     *
     * @param conn The opened HTTP connection to fetch the encoding for
     * @return The string name of the encoding. utf-8 is the default.
     */
    private static String getEncoding(HttpURLConnection conn) {
        String encoding = "utf-8";
        String contentType = conn.getHeaderField("Content-Type").toLowerCase();
        if (contentType.contains("charset=")) {
            int found = contentType.indexOf("charset=");
            encoding = contentType.substring(found + 8, contentType.length()).trim();
        } else if (conn.getContentEncoding() != null) {
            encoding = conn.getContentEncoding();
        }
        return encoding;
    }

    /**
     * Perform an HTTP POST network request to retrieve text from a remote web site or API. Specify a callback
     * to handle the text parsing and UI updating.
     *
     * @param url      The HTTP address to fetch text from
     * @param param    the json parameter to send
     * @param callback The event handlers that will be called by the helper method
     */
    public void post(final String url, final JSONObject param, final IHttpPostCallback<IJsonResponse> callback) {
        new AsyncTask<Void, Void, IJsonResponse>() {
            @Override
            protected IJsonResponse doInBackground(Void... voids) {

                IJsonResponse jsonResponse = null;

                HttpParams params = new BasicHttpParams();
                HttpConnectionParams.setConnectionTimeout(params, 10000);
                HttpConnectionParams.setSoTimeout(params, 10000);
                HttpClient client = new DefaultHttpClient(params);

                try {

                    HttpPost post = new HttpPost(url);
                    StringEntity se = new StringEntity(param.toString());
                    post.setEntity(se);
                    post.setHeader("Accept", "application/json");
                    post.setHeader("Content-type", "application/json");
                    HttpResponse response = client.execute(post);

                    if (response.getStatusLine().getStatusCode() == 200) {
                        // 9. receive response as inputStream
                        String jsonString = readAll(response.getEntity().getContent(), "utf-8");
                        JSONObject result = new JSONObject(jsonString);

                        jsonResponse = new JsonResponse(result);
                    } else {

                        jsonResponse = new JsonResponse();
                        jsonResponse.setErrorMessage(response.getStatusLine().getStatusCode()+"");
                    }
                } catch (Exception e) {

                    jsonResponse = new JsonResponse();
                    jsonResponse.setErrorMessage(e.getMessage());
                }

                return jsonResponse;
            }

            @Override
            protected void onPostExecute(IJsonResponse result) {
                callback.exec(result);
            }
        }.execute();
    }
}
