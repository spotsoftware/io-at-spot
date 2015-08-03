package it.spot.io.lib.api.workTimeEntries;

import java.util.Date;

import it.spot.io.lib.api.shared.Entity;

/**
 * @author a.rinaldi
 */
public class WorkTimeEntry
        extends Entity {

    private Date performedAt;
    private boolean manual;
    private WorkTimeEntryTypes workTimeEntryType;

    // region Construction

    public WorkTimeEntry() {
        super();
    }

    // endregion

    // region Public methods

    public Date getPerformedAt() {
        return this.performedAt;
    }

    public WorkTimeEntry setPerformedAt(Date date) {
        this.performedAt = date;
        return this;
    }

    public WorkTimeEntryTypes getType() {
        return this.workTimeEntryType;
    }

    public WorkTimeEntry setType(WorkTimeEntryTypes type) {
        this.workTimeEntryType = type;
        return this;
    }

    public boolean isManual() {
        return this.manual;
    }

    public WorkTimeEntry setIsManual(boolean manual) {
        this.manual = manual;
        return this;
    }

    // endregion

    // region

    public enum WorkTimeEntryTypes {
        IN, OUT
    }

    // endregion
}

/**
 * var WorkTimeEntrySchema = new BaseSchema({
 * _user: {
 * type: Schema.ObjectId,
 * ref: 'User',
 * required: true
 * },
 * _organization: {
 * type: Schema.ObjectId,
 * ref: 'Organization',
 * required: true
 * },
 * performedAt: {
 * type: Date,
 * default: Date.now
 * },
 * workTimeEntryType: {
 * type: String,
 * enum: ['in', 'out'],
 * required: true
 * },
 * manual: {
 * type: Boolean,
 * default: false,
 * required: true
 * },
 * externalId: {
 * required: false,
 * type: String
 * }
 * });
 */