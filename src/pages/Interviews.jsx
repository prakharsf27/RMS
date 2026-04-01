import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Calendar, Clock, Video, MapPin, Plus, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import styles from "./Interviews.module.css";

export default function Interviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applications, setApplications] = useState([]);
  
  const [formData, setFormData] = useState({
    applicationId: "",
    candidateId: "",
    candidateName: "",
    jobTitle: "",
    date: "",
    time: "",
    type: "virtual", // virtual, in-person
    location: "", // link or address
    notes: ""
  });


  const fetchData = async () => {
    setLoading(true);
    try {
      const [intRes, appRes] = await Promise.all([
        api.get("/interviews"),
        user.role !== "candidate" ? api.get("/applications") : Promise.resolve({ data: [] })
      ]);
      setInterviews(intRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error("Fetch interviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user._id]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post("/interviews", formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/interviews/${id}`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <div>
          <h1 className="text-gradient">Interview Schedules</h1>
          <p>Coordinate and manage candidate assessments across your organization.</p>
        </div>
        {(user.role === "recruiter" || user.role === "admin") && (
           <Button onClick={() => setShowModal(true)}>
             <Plus size={18} /> Schedule Interview
           </Button>
        )}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainList}>
           {loading ? (
             <LoadingSpinner label="Coordinating calendar..." />
           ) : interviews.length > 0 ? (
             interviews.map(int => (
               <Card key={int._id} className={styles.intCard}>
                  <div className={styles.intMain}>
                    <div className={styles.intIcon}>
                       {int.type === 'virtual' ? <Video size={24} /> : <MapPin size={24} />}
                    </div>
                    <div className={styles.intInfo}>
                       <h3>{int.candidateId?.fname || 'Unknown'} {int.candidateId?.lname || 'Candidate'}</h3>
                       <p className={styles.jobText}>{int.jobTitle}</p>
                       <div className={styles.metaRow}>
                          <span className={styles.metaItem}><Calendar size={14} /> {format(new Date(int.date), "MMM d, yyyy")}</span>
                          <span className={styles.metaItem}><Clock size={14} /> {int.time}</span>
                          <span className={styles.metaItem}>
                             {int.type === 'virtual' ? <Video size={14} /> : <MapPin size={14} />} 
                             {int.type === 'virtual' ? "Virtual Call" : "On-Site"}
                          </span>
                       </div>
                    </div>
                    <div className={styles.intStatus}>
                       <Badge variant={int.status === 'scheduled' ? 'info' : 'success'}>
                         {int.status}
                       </Badge>
                    </div>
                  </div>
                  
                  <div className={styles.intFooter}>
                     <div className={styles.locationBox}>
                        <strong>{int.type === 'virtual' ? "Meeting Link:" : "Address:"}</strong>
                        <span className={styles.locValue}>{int.location}</span>
                     </div>
                     {user.role !== 'candidate' && int.status === 'scheduled' && (
                        <div className={styles.actions}>
                           <Button size="sm" variant="success" onClick={() => handleUpdateStatus(int._id, 'completed')}>
                             <CheckCircle size={14} /> Complete
                           </Button>
                           <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleUpdateStatus(int._id, 'cancelled')}>
                             <XCircle size={14} /> Cancel
                           </Button>
                        </div>
                     )}
                  </div>
               </Card>
             ))
           ) : (
             <Card className={styles.emptyCard}>
                <Calendar size={48} opacity={0.2} />
                <p>No interviews scheduled at this time.</p>
             </Card>
           )}
        </div>
        
        <aside className={styles.sidebar}>
           <Card className={styles.helpCard}>
              <h4>Pro Tip 💡</h4>
              <p>Virtual interviews allow for remote-first hiring and faster turnaround. Always include a backup contact number in the notes.</p>
           </Card>
           <Card className={styles.statsCard}>
              <div className={styles.statItem}>
                 <span className={styles.statVal}>{interviews.length}</span>
                 <span className={styles.statLab}>Total Today</span>
              </div>
           </Card>
        </aside>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Schedule New Interview"
      >
        <form onSubmit={handleSchedule} className={styles.modalForm}>
           <div className={styles.formGroup}>
              <label>Select Candidate Application</label>
              <select 
                className={styles.select}
                onChange={(e) => {
                    const app = applications.find(a => a._id === e.target.value);
                    if (app) {
                        setFormData({
                            ...formData,
                            applicationId: app._id,
                            candidateId: app.candidateId._id,
                            candidateName: `${app.candidateId.fname} ${app.candidateId.lname}`,
                            jobTitle: app.jobId.title
                        });
                    }
                }}

                required
              >
                <option value="">Choose a candidate application...</option>
                {applications.filter(a => a.status === 'applied' && a.candidateId).map(app => (
                    <option key={app._id} value={app._id}>
                        {app.candidateId.fname} {app.candidateId.lname} - {app.jobId?.title || 'Unknown Role'}
                    </option>
                ))}
              </select>
           </div>

           <div className={styles.formRow}>
              <Input 
                label="Interview Date" 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
              <Input 
                label="Time" 
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
           </div>

           <div className={styles.formGroup}>
              <label>Interview Type</label>
              <div className={styles.typeToggle}>
                 <button 
                   type="button" 
                   className={formData.type === 'virtual' ? styles.active : ''}
                   onClick={() => setFormData({...formData, type: 'virtual', location: ''})}
                 >
                   Virtual
                 </button>
                 <button 
                   type="button" 
                   className={formData.type === 'in-person' ? styles.active : ''}
                   onClick={() => setFormData({...formData, type: 'in-person', location: ''})}
                 >
                   In-Person
                 </button>
              </div>
           </div>

           <Input 
             label={formData.type === 'virtual' ? "Meeting Link (Zoom/Meet)" : "Office Address"}
             placeholder={formData.type === 'virtual' ? "https://meet.google.com/..." : "123 Tech Lane, Silicon Valley"}
             value={formData.location}
             onChange={(e) => setFormData({...formData, location: e.target.value})}
             required
           />

           <div className={styles.formGroup}>
              <label>Internal Notes</label>
              <textarea 
                className={styles.textarea}
                placeholder="Specific topics to cover or panelist names..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
           </div>

           <div className={styles.modalFooter}>
             <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
             <Button type="submit">Confirm Schedule</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
