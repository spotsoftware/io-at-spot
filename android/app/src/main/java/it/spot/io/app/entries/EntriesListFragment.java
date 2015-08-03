package it.spot.io.app.entries;

import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import it.spot.io.android.BaseFragment;
import it.spot.io.android.R;
import it.spot.io.lib.api.Api;
import it.spot.io.lib.api.workTimeEntries.WorkTimeEntriesInterface;
import it.spot.io.lib.api.workTimeEntries.WorkTimeEntry;

/**
 * @author a.rinaldi
 */
public class EntriesListFragment
        extends BaseFragment {

    // region Fragment life cycle

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_entries_list, container, false);

//        new Thread() {
//            @Override
//            public void run() {
//                Map<String, String> filters = new HashMap<String, String>();
//                try {
//                    filters.put("members", new JSONArray().put(0, "55433f97cb0208160020f3db").toString());
//                } catch (JSONException e) {
//                    e.printStackTrace();
//                }
//                WorkTimeEntriesInterface endPoint = Api.getInstance().getRestAdapter().create(WorkTimeEntriesInterface.class);
//                List<WorkTimeEntry> entries = endPoint.get("5578236ba5d5b416001ec31b", filters);
//
//                Log.e("ENTRIES", "total entries: " + entries.size());
//            }
//        }.start();

        return view;
    }

    // endregion
}
