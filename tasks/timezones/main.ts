import { existsSync } from "jsr:@std/fs/exists";

interface Offset {
  offset: string;
  offsetNanoseconds: number;
}

interface Transition {
  dateTime: string;
  before: Offset;
  after: Offset;
}

interface FindTransitionsOptions {
  start?: Temporal.PlainDate;
  timezone: string;
  limit:
    | { maxTransitions: number; until?: never }
    | { until: Temporal.PlainDate; maxTransitions?: never };
}

export function findTransitions({
  start,
  timezone,
  limit,
}: FindTransitionsOptions) {
  let dt = Temporal.ZonedDateTime.from({
    year: start?.year,
    month: start?.month,
    day: start?.day,
    timeZone: timezone,
  });
  const transitions: Transition[] = [];

  let previousOffset = dt.offset;
  let previousOffsetNanoseconds = dt.offsetNanoseconds;

  let transitionCount = 0;
  do {
    const transition = dt.getTimeZoneTransition("next");

    if (transition === null) {
      break;
    }

    transitions.push({
      dateTime: transition.toString(),
      before: {
        offset: previousOffset,
        offsetNanoseconds: previousOffsetNanoseconds,
      },
      after: {
        offset: transition.offset,
        offsetNanoseconds: transition.offsetNanoseconds,
      },
    });

    dt = transition;
    previousOffset = transition.offset;
    previousOffsetNanoseconds = transition.offsetNanoseconds;
    transitionCount++;
  } while (
    (limit?.maxTransitions && transitionCount < limit.maxTransitions) ||
    (limit?.until &&
      Temporal.PlainDate.compare(dt.toPlainDate(), limit.until) < 0)
  );

  return transitions;
}

export function findAllTransitions() {
  const allTransitionsData: Record<string, unknown[]> = {};

  // from 2000-01-01
  const start = Temporal.PlainDate.from({ year: 2000, month: 1, day: 1 });
  // until 2030-01-01
  const until = Temporal.PlainDate.from({ year: 2030, month: 1, day: 1 });

  for (const timezone of getTimezones()) {
    console.log(`Processing timezone: ${timezone}`);

    const transitions = findTransitions({ timezone, start, limit: { until } });

    const filePath = `./transitions/${timezone.replaceAll("/", "_")}.json`;
    Deno.writeTextFileSync(filePath, JSON.stringify(transitions, null, 2));
  }

  return allTransitionsData;
}

function getTimezones(): string[] {
  return Intl.supportedValuesOf("timeZone");
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Finding all timezone transitions...");
  if (!existsSync("./transitions", { isDirectory: true })) {
    Deno.mkdirSync("./transitions");
  }
  findAllTransitions();
}
