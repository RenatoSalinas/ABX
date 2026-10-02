import { useEffect, useState } from 'react';
import { api } from '../../api';
import EventosSection from './EventosSection';
import CompromisosSection from './CompromisosSection';

export default function OpportunityDetail({ opportunity }) {
  const [events, setEvents] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [ev, cm, et] = await Promise.all([
        api.get(`/opportunities/${opportunity.id}/events`),
        api.get(`/opportunities/${opportunity.id}/commitments`),
        api.get('/event-types')
      ]);
      setEvents(ev.events);
      setCommitments(cm.commitments);
      setEventTypes(et.eventTypes);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunity.id]);

  return (
    <div className="opp-detail">
      {error && <div className="error-banner">{error}</div>}
      <div className="detail-grid">
        <EventosSection
          opportunityId={opportunity.id}
          events={events}
          eventTypes={eventTypes}
          onChange={load}
        />
        <CompromisosSection
          opportunityId={opportunity.id}
          commitments={commitments}
          onChange={load}
        />
      </div>
    </div>
  );
}
