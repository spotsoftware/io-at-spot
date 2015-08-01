package it.spot.io.app.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

import it.spot.io.android.R;
import it.spot.io.app.splash.SplashActivity;

/**
 * @author a.rinaldi
 */
public class WidgetProvider extends AppWidgetProvider {

    // { AppWidgetProvider implementation

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        super.onUpdate(context, appWidgetManager, appWidgetIds);
        Log.e(this.getClass().getSimpleName(), "onUpdate()");

        final int N = appWidgetIds.length;

        // Perform this loop procedure for each App Widget that belongs to this provider
        for (int i=0; i<N; i++) {
            int appWidgetId = appWidgetIds[i];

            // Create an Intent to launch ExampleActivity
            Intent intent = new Intent(context, SplashActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);

            // Get the layout for the App Widget and attach an on-click listener
            // to the button
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_provider);
            views.setOnClickPendingIntent(R.id.button, pendingIntent);

            // Tell the AppWidgetManager to perform an update on the current app widget
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        Log.e(this.getClass().getSimpleName(), "onAppWidgetOptionsChanged()");
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        Log.e(this.getClass().getSimpleName(), "onDeleted()");
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        Log.e(this.getClass().getSimpleName(), "onEnabled()");
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        Log.e(this.getClass().getSimpleName(), "onDisabled()");
    }

    // }
}
