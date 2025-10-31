
import { Phone, MessageCircle, User } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import RatingDisplay from '../RatingDisplay';
import './DriverProfileCard.css';

const DriverProfileCard = ({
  driver,
  onCall,
  onMessage,
  compact = false,
  className = ''
}) => {
  // Handle missing driver data
  if (!driver) {
    return (
      <Card className={`driver-profile-card driver-profile-card--loading ${className}`}>
        <div className="driver-profile-card__content">
          <div className="driver-profile-card__avatar driver-profile-card__avatar--skeleton" />
          <div className="driver-profile-card__info">
            <div className="driver-profile-card__name driver-profile-card__name--skeleton" />
            <div className="driver-profile-card__rating driver-profile-card__rating--skeleton" />
            <div className="driver-profile-card__rides driver-profile-card__rides--skeleton" />
          </div>
        </div>
      </Card>
    );
  }

  const {
    name,
    photo,
    rating = 0,
    totalRides = 0,
    phoneNumber
  } = driver;

  const handleCall = () => {
    if (onCall && phoneNumber) {
      onCall(phoneNumber, driver);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(driver);
    }
  };

  const hasContactOptions = (phoneNumber && onCall) || onMessage;

  return (
    <Card 
      className={`driver-profile-card ${compact ? 'driver-profile-card--compact' : ''} ${className}`}
      padding="lg"
      shadow="md"
    >
      <div className="driver-profile-card__content">
        {/* Driver Avatar */}
        <div className="driver-profile-card__avatar-container">
          {photo ? (
            <img
              src={photo}
              alt={`${name}'s profile`}
              className="driver-profile-card__avatar"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="driver-profile-card__avatar driver-profile-card__avatar--fallback"
            style={{ display: photo ? 'none' : 'flex' }}
          >
            <User className="driver-profile-card__avatar-icon" />
          </div>
        </div>

        {/* Driver Information */}
        <div className="driver-profile-card__info">
          <div className="driver-profile-card__header">
            <h3 className="driver-profile-card__name">
              {name || 'Driver'}
            </h3>
            
            {/* Rating Display */}
            <div className="driver-profile-card__rating">
              <RatingDisplay 
                rating={rating} 
                showNumber={true}
                size="sm"
              />
            </div>
          </div>

          {/* Total Rides Badge */}
          <div className="driver-profile-card__stats">
            <Badge 
              variant="default" 
              color="primary" 
              size="sm"
              className="driver-profile-card__rides-badge"
            >
              {totalRides.toLocaleString()} rides completed
            </Badge>
          </div>

          {/* Contact Actions */}
          {hasContactOptions && !compact && (
            <div className="driver-profile-card__actions">
              {onCall && phoneNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Phone className="w-4 h-4" />}
                  onClick={handleCall}
                  className="driver-profile-card__action-button"
                  aria-label={`Call ${name || 'Driver'}`}
                >
                  Call
                </Button>
              )}
              
              {onMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<MessageCircle className="w-4 h-4" />}
                  onClick={handleMessage}
                  className="driver-profile-card__action-button"
                  aria-label={`Message ${name || 'Driver'}`}
                >
                  Message
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compact Contact Actions */}
      {hasContactOptions && compact && (
        <div className="driver-profile-card__compact-actions">
          {onCall && phoneNumber && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Phone className="w-4 h-4" />}
              onClick={handleCall}
              className="driver-profile-card__compact-action"
              aria-label={`Call ${name || 'Driver'}`}
            />
          )}
          
          {onMessage && (
            <Button
              variant="ghost"
              size="sm"
              icon={<MessageCircle className="w-4 h-4" />}
              onClick={handleMessage}
              className="driver-profile-card__compact-action"
              aria-label={`Message ${name || 'Driver'}`}
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default DriverProfileCard;