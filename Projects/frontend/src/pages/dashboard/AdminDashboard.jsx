import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Spinner } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CSVLink } from 'react-csv';
import adminService from '../../services/adminService'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState({
    stats: true,
    users: true,
    properties: true,
    bookings: true
  });
  const [summary, setSummary] = useState({
    owners: 0,
    renters: 0,
    properties: 0,
    bookings: 0
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const stats = await adminService.getDashboardStats();
        setSummary(stats);
        setLoading(prev => ({ ...prev, stats: false }));

        // Fetch users
        const usersData = await adminService.getAllUsers();
        setUsers(usersData);
        setLoading(prev => ({ ...prev, users: false }));

        // Fetch properties
        const propertiesData = await adminService.getAllProperties();
        setProperties(propertiesData);
        setLoading(prev => ({ ...prev, properties: false }));

        // Fetch bookings
        const bookingsData = await adminService.getAllBookings();
        setBookings(bookingsData);
        setLoading(prev => ({ ...prev, bookings: false }));
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error (show toast/alert)
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRemoveUser = async (id) => {
    if (window.confirm('Remove this user?')) {
      try {
        await adminService.deleteUser(id);
        setUsers(prev => prev.filter(user => user._id !== id));
        setSummary(prev => ({
          ...prev,
          owners: prev.owners - (users.find(u => u._id === id)?.type === 'owner' ? 1 : 0),
          renters: prev.renters - (users.find(u => u._id === id)?.type === 'renter' ? 1 : 0)
        }));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleRemoveProperty = async (id) => {
    if (window.confirm('Remove this property?')) {
      try {
        await adminService.deleteProperty(id);
        setProperties(prev => prev.filter(prop => prop._id !== id));
        setSummary(prev => ({ ...prev, properties: prev.properties - 1 }));
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Cancel this booking?')) {
      try {
        await adminService.cancelBooking(id);
        setBookings(prev => prev.filter(booking => booking._id !== id));
        setSummary(prev => ({ ...prev, bookings: prev.bookings - 1 }));
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
    <style>{`
      .admin-gradient-header {
        background: linear-gradient(90deg, #007bff 0%, #00c6ff 100%);
        color: #fff;
        padding: 1.5rem 0;
        border-radius: 0.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        margin-bottom: 2rem;
      }
      .admin-summary-card {
        border-radius: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        font-size: 1.2rem;
        font-weight: 500;
        margin-bottom: 1rem;
      }
      .admin-table th {
        background: #007bff;
        color: #fff;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .admin-table td {
        vertical-align: middle;
      }
      .admin-table tr {
        transition: background 0.2s;
      }
      .admin-table tr:hover {
        background: #f1f8ff;
      }
    `}</style>
    <Container fluid>
      <div className="admin-gradient-header text-center position-relative">
        <h2 className="mb-0">🛠️ Admin Dashboard</h2>
        <Button
          variant="outline-light"
          style={{ position: 'absolute', top: 20, right: 30 }}
          onClick={handleLogout}
        >Logout</Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4 text-center">
        {loading.stats ? (
          <Col><Card className="admin-summary-card"><Card.Body><Spinner animation="border" /></Card.Body></Card></Col>
        ) : (
          <>
            <Col><Card className="admin-summary-card" bg="info" text="white"><Card.Body>Total Owners: {summary.owners}</Card.Body></Card></Col>
            <Col><Card className="admin-summary-card" bg="warning" text="white"><Card.Body>Total Renters: {summary.renters}</Card.Body></Card></Col>
            <Col><Card className="admin-summary-card" bg="success" text="white"><Card.Body>Total Properties: {summary.properties}</Card.Body></Card></Col>
            <Col><Card className="admin-summary-card" bg="danger" text="white"><Card.Body>Active Bookings: {summary.bookings}</Card.Body></Card></Col>
          </>
        )}
      </Row>

      {/* Search & Refresh */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            placeholder="🔍 Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Button variant="secondary" onClick={() => window.location.reload()}>🔄 Refresh</Button>
        </Col>
        <Col md={3}>
          <CSVLink data={users} filename="users.csv" className="btn btn-success">🧾 Export Users</CSVLink>
        </Col>
      </Row>

      {/* Users Table */}
      <Card className="mb-4">
        <Card.Header>👥 User Management</Card.Header>
        <Card.Body>
          {loading.users ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Table striped bordered hover className="admin-table">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Type</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.type}</td>
                    <td><Button variant="danger" onClick={() => handleRemoveUser(user._id)}>Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Properties Table */}
      <Card className="mb-4">
        <Card.Header>📦 Property Management</Card.Header>
        <Card.Body>
          {loading.properties ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Table striped bordered hover className="admin-table">
              <thead>
                <tr><th>ID</th><th>Title</th><th>Location</th><th>Rent</th><th>Owner</th><th>Action</th></tr>
              </thead>
              <tbody>
                {properties.map(prop => (
                  <tr key={prop._id}>
                    <td>{prop._id}</td>
                    <td>{prop.title || prop.prop_address}</td>
                    <td>{prop.location ? `${prop.location.city}, ${prop.location.state}` : prop.prop_address}</td>
                    <td>₹{prop.rent || prop.prop_amt}</td>
                    <td>{prop.userId?.name || 'Unknown'}</td>
                    <td><Button variant="danger" onClick={() => handleRemoveProperty(prop._id)}>Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Booking Table */}
      <Card className="mb-4">
        <Card.Header>📖 Booking Management</Card.Header>
        <Card.Body>
          {loading.bookings ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Table striped bordered hover className="admin-table">
              <thead>
                <tr><th>ID</th><th>Renter</th><th>Property</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>{b._id}</td>
                    <td>{b.userId?.name}</td>
                    <td>{b.propertyId?.title}</td>
                    <td>{b.status}</td>
                    <td><Button variant="danger" onClick={() => handleCancelBooking(b._id)}>Cancel</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
    </>
  );
};

export default AdminDashboard;