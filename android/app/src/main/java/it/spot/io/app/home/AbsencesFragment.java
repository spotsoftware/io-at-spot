package it.spot.io.app.home;

import android.app.Fragment;
import android.app.FragmentManager;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v13.app.FragmentStatePagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import it.spot.io.android.BaseFragment;
import it.spot.io.android.R;
import it.spot.io.android.views.SlidingTabLayout;
import it.spot.io.app.absences.AbsencesListFragment;
import it.spot.io.app.absences.AbsencesNewActivity;
import it.spot.io.app.absences.AbsencesStatsFragment;

/**
 * @author a.rinaldi
 */
public class AbsencesFragment
        extends BaseFragment {

    private ViewPager mPager;
    private AbsencesPagerAdapter mPagerAdapter;
    private SlidingTabLayout mPagerTabs;

    // region Fragment life cycle

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_absences, container, false);

        this.mPagerAdapter = new AbsencesPagerAdapter(this.getChildFragmentManager());
        this.mPager = (ViewPager) view.findViewById(R.id.pager);
        this.mPager.setAdapter(this.mPagerAdapter);

        this.mPagerTabs = (SlidingTabLayout) view.findViewById(R.id.tabs);
        this.mPagerTabs.setDistributeEvenly(true);
        this.mPagerTabs.setViewPager(this.mPager);
        this.mPagerTabs.setCustomTabColorizer(new SlidingTabLayout.TabColorizer() {
            @Override
            public int getIndicatorColor(int position) {
                return Color.WHITE;
            }
        });

        view.findViewById(R.id.create_btn).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getActivity().startActivity(new Intent(getActivity(), AbsencesNewActivity.class));
            }
        });

        return view;
    }

    // endregion

    // region Private inner classes

    private class AbsencesPagerAdapter
            extends FragmentStatePagerAdapter {

        // region Construction

        public AbsencesPagerAdapter(FragmentManager fm) {
            super(fm);
        }

        // endregion

        // region FragmentPagerAdapter implementation

        @Override
        public Fragment getItem(int position) {
            if (position == 0) {
                return new AbsencesListFragment();
            }
            return new AbsencesStatsFragment();
        }

        @Override
        public int getCount() {
            return 2;
        }

        @Override
        public CharSequence getPageTitle(int position) {
            if (position == 0) {
                return getString(R.string.absences);
            }
            return getString(R.string.stats);
        }

        // endregion
    }

    // endregion
}
