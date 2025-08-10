// In your PropertyDetails.jsx
import BookingForm from './BookingForm';

const PropertyDetails = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  return (
    <div>
      {/* Property details here */}
      <Button onClick={() => setShowBookingForm(true)}>
        Book Now
      </Button>
      
      <BookingForm 
        propertyId={property._id} 
        show={showBookingForm} 
        onHide={() => setShowBookingForm(false)} 
      />
    </div>
  );
};