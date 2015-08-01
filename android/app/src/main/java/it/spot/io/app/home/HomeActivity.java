package it.spot.io.app.home;

import android.app.AlertDialog;
import android.app.FragmentManager;
import android.content.DialogInterface;
import android.os.Bundle;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import it.spot.io.android.BaseActivity;
import it.spot.io.android.BaseFragment;
import it.spot.io.android.R;

/**
 * @author a.rinaldi
 */
public class HomeActivity
        extends BaseActivity
        implements AdapterView.OnItemClickListener {

    public static final int HOME_PAGE_ID = 0;
    public static final int ENTRIES_PAGE_ID = 1;
    public static final int ABSENCES_PAGE_ID = 2;

    private ActionBarDrawerToggle mDrawerToggle;
    private DrawerLayout mDrawer;
    private ListView mDrawerList;
    private String[] mDrawerVoices;

    private int mCurrentPage;

    // region Activity life cycle

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_home);

        this.initializeDrawer();

        this.mCurrentPage = -1;
        this.navigate(HOME_PAGE_ID);
    }

    @Override
    public void onBackPressed() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.attention)
                .setMessage(R.string.exit_confirmation)
                .setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                })
                .setPositiveButton(R.string.exit, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                        finish();
                    }
                })
                .create().show();
    }

    // endregion

    // region AdapterView.OnItemClickListener implementation

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        this.navigate(position);
    }

    // endregion

    // region Private methods

    private void navigate(int page) {
        if (mCurrentPage == page) {
            return;
        }

        BaseFragment fragment;

        switch (page) {
            case HOME_PAGE_ID:
                fragment = new HomeFragment();
                break;
            case ENTRIES_PAGE_ID:
                fragment = new EntriesFragment();
                break;
            case ABSENCES_PAGE_ID:
            default:
                fragment = new AbsencesFragment();
                break;
        }

        FragmentManager fragmentManager = getFragmentManager();
        fragmentManager.beginTransaction()
                .replace(R.id.content_frame, fragment)
                .commit();

        // Highlight the selected item, update the title, and close the drawer
        this.mDrawerList.setItemChecked(page, true);
        this.setTitle(this.mDrawerVoices[page]);
        this.mDrawer.closeDrawer(this.mDrawerList);

        this.mCurrentPage = page;
    }

    private void initializeDrawer() {
        this.mDrawerVoices = this.getResources().getStringArray(R.array.menu_voices);
        this.mDrawer = (DrawerLayout) this.findViewById(R.id.drawer_layout);
        this.mDrawerList = (ListView) this.mDrawer.findViewById(R.id.left_drawer);
        this.mDrawerList.setAdapter(new ArrayAdapter<String>(this,
                R.layout.drawer_item,
                this.mDrawerVoices));
        this.mDrawerList.setOnItemClickListener(this);

        Toolbar toolbar = (Toolbar) this.findViewById(R.id.toolbar);
        this.setSupportActionBar(toolbar);

        this.mDrawerToggle = new ActionBarDrawerToggle(this, mDrawer,
                toolbar, R.string.action_settings, R.string.action_logout);
        this.mDrawer.setDrawerListener(this.mDrawerToggle);
        this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        this.getSupportActionBar().setHomeButtonEnabled(true);
        this.mDrawerToggle.syncState();
    }

    // endregion
}
