import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { cacheLife } from "next/cache";

import Event, { IEvent } from "@/database/event.model";
import connectDB from "@/lib/mongodb";

const Home = async () => {
  "use cache";
  cacheLife("hours");

  let events: IEvent[] = [];
  let hasError = false;

  try {
    await connectDB();
    events = await Event.find({
      date: { $gte: new Date() },
    })
      .sort({ date: 1 })
      .lean<IEvent[]>();
  } catch (error) {
    hasError = true;
    console.error("Error fetching events:", error);
  }

  return (
    <section aria-label="Developer events hub introduction">
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>

      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        {hasError ? (
          <p>Unable to load events right now.</p>
        ) : events.length > 0 ? (
          <ul id="events" className="events">
            {events.map((event) => (
              <li key={event.slug} className="list-none">
                <EventCard {...event} date={new Date(event.date)} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No events available.</p>
        )}
      </div>
    </section>
  );
};

export default Home;
