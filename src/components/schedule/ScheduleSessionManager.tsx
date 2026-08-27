import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  DoorClosed,
  Plus,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SessionEntity } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';

export const ScheduleSessionManager: React.FC = () => {
  const {
    t,
    isRtl,
    classes,
    rooms,
    sessions,
    createSession,
    updateSessionStatus,
    hasPermission,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  const [sessionDate, setSessionDate] = useState('2026-03-30');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter sessions
  const [filterClass, setFilterClass] = useState<number | 'ALL'>('ALL');
  const [filterRoom, setFilterRoom] = useState<number | 'ALL'>('ALL');

  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Conflict Check in State
  const conflicts = useMemo(() => {
    if (!sessionDate || !startTime || !endTime) return [];
    return sessions.filter((s) => {
      if (s.sessionDate !== sessionDate) return false;
      if (s.status === 'CANCELLED') return false;
      const overlap = startTime < s.endTime && endTime > s.startTime;
      if (!overlap) return false;
      // Room conflict or Teacher conflict
      const sameRoom = s.roomId === selectedRoomId;
      const sameTeacher = s.teacherId === selectedClass?.teacherId;
      return sameRoom || sameTeacher;
    });
  }, [sessions, sessionDate, startTime, endTime, selectedRoomId, selectedClass]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (conflicts.length > 0) {
      setFeedback({
        type: 'error',
        message: 'Conflict detected: Room or Teacher is already booked during this time interval.',
      });
      return;
    }

    const res = createSession({
      classId: selectedClassId,
      roomId: selectedRoomId,
      sessionDate,
      startTime,
      endTime,
      topic: topic || `${selectedClass?.name} - Regular Lecture`,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTopic('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterClass !== 'ALL' && s.classId !== filterClass) return false;
      if (filterRoom !== 'ALL' && s.roomId !== filterRoom) return false;
      return true;
    });
  }, [sessions, filterClass, filterRoom]);

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.schedule.title}
        subtitle={t.schedule.subtitle}
        icon={Calendar}
        badge="Session Orchestration"
        breadcrumbs={[
          { label: '60 Center' },
          { label: t.nav.classSchedules },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: CREATE SESSION WITH CONFLICT DETECTION */}
        <div className="lg:col-span-1 space-y-4">
          <SectionCard
            title={t.schedule.newSession}
            subtitle="Book lecture slot with real-time room conflict prevention"
            icon={<Clock className="w-5 h-5 text-cyan-600" />}
          >
            <form onSubmit={handleCreateSession} className="space-y-4">
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Group / Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.teacherName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room / Auditorium <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {rooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.nameEn} ({rm.capacity} seats • {rm.floor})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Slot */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Date</label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Unit 4: Electromagnetic Induction"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Real-time Conflict Alert */}
              {conflicts.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Booking Collision:</span> {conflicts.length} overlapping session(s) in {rooms.find(r => r.id === selectedRoomId)?.nameEn}.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={conflicts.length > 0 || (!hasPermission('SESSION_CREATE'))}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Session</span>
              </button>
            </form>
          </SectionCard>
        </div>

        {/* RIGHT 2 COLUMNS: SESSION TIMETABLE & STATUS CONTROLS */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard
            title={t.schedule.sessionsList}
            subtitle="Master timetable with status transition triggers and room occupancy"
            badge={`${filteredSessions.length} Scheduled`}
            icon={<Calendar className="w-5 h-5 text-slate-700" />}
          >
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Class Groups</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Rooms</option>
                  {rooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-900 text-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-start">Class & Topic</th>
                    <th className="px-4 py-3 text-start">Instructor</th>
                    <th className="px-4 py-3 text-start">Date & Time</th>
                    <th className="px-4 py-3 text-start">Room</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredSessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{sess.className}</div>
                        <div className="text-[11px] text-slate-500">{sess.topic || 'Regular Lesson'}</div>
                      </td>
                      <td className="px-4 py-3 text-cyan-900 font-semibold">{sess.teacherName}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">
                        <div>{sess.sessionDate}</div>
                        <div className="text-slate-500">{sess.startTime} - {sess.endTime}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{sess.roomName}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sess.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sess.status === 'IN_PROGRESS'
                              ? 'bg-cyan-100 text-cyan-800 animate-pulse'
                              : sess.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sess.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <select
                          value={sess.status}
                          onChange={(e) => updateSessionStatus(sess.id, e.target.value as any)}
                          className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-[11px] font-semibold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
