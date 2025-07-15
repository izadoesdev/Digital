import { State, makeSchema, synced } from "@livestore/livestore";
import { Schema } from "@livestore/utils/effect";

export const calendars = State.SQLite.table({
  name: "calendar",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    name: State.SQLite.text({ nullable: true }),
    description: State.SQLite.text({ nullable: true }),
    timeZone: State.SQLite.text({ nullable: true }),
    primary: State.SQLite.boolean({ default: false }),
    color: State.SQLite.text({ nullable: true }),
    calendarId: State.SQLite.text(),
    syncToken: State.SQLite.text({ nullable: true }),
    providerId: State.SQLite.text(),
    accountId: State.SQLite.text(),
    createdAt: State.SQLite.datetime({ default: { sql: "CURRENT_TIMESTAMP" } }),
    updatedAt: State.SQLite.datetime({ default: { sql: "CURRENT_TIMESTAMP" } }),
  },
  indexes: [{ name: "calendar_account_idx", columns: ["accountId"] }],
});

export const events = State.SQLite.table({
  name: "event",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    title: State.SQLite.text({ nullable: true }),
    description: State.SQLite.text({ nullable: true }),
    start: State.SQLite.datetime(),
    startTimeZone: State.SQLite.text({ nullable: true }),
    end: State.SQLite.datetime(),
    endTimeZone: State.SQLite.text({ nullable: true }),
    allDay: State.SQLite.boolean({ default: false }),
    location: State.SQLite.text({ nullable: true }),
    status: State.SQLite.text({ nullable: true }),
    url: State.SQLite.text({ nullable: true }),
    syncToken: State.SQLite.text({ nullable: true }),
    calendarId: State.SQLite.text(),
    providerId: State.SQLite.text(),
    accountId: State.SQLite.text(),
    createdAt: State.SQLite.datetime({ default: { sql: "CURRENT_TIMESTAMP" } }),
    updatedAt: State.SQLite.datetime({ default: { sql: "CURRENT_TIMESTAMP" } }),
  },
  indexes: [
    { name: "event_account_idx", columns: ["accountId"] },
    {
      name: "event_account_calendar_idx",
      columns: ["accountId", "calendarId"],
      isUnique: true,
    },
  ],
});

export const eventDefs = {
  createCalendar: synced({
    name: "createCalendar",
    schema: calendars.insertSchema,
  }),
  createEvent: synced({
    name: "createEvent",
    schema: events.insertSchema,
  }),
};

export const state = State.SQLite.makeState({
  tables: { calendars, events },
  materializers: {},
});

export const schema = makeSchema({
  state,
  events: eventDefs,
});
