# Cloudinary Integration Guide

## ✅ Implementation Complete

Your real-estate-app now has **complete Cloudinary image upload integration** with the following features:

---

## 📋 What Was Implemented

### 1. **Cloudinary Configuration** ✓
- Updated `.env` with Cloudinary credentials:
  ```env
  CLOUDINARY_CLOUD_NAME=dum91ekf0
  CLOUDINARY_API_KEY=617176435619329
  CLOUDINARY_API_SECRET=bLnk0yOkiERZtH3jztPxCQdlcHM
  ```

### 2. **File Upload Module** ✓
- Updated `Backend/Config/FileUpload.js` with:
  - `uploadToCloudinary()` - Upload single image
  - `uploadMultipleToCloudinary()` - Upload multiple gallery images
  - Multer middleware for file handling (30MB max per file)
  - Support for PNG, JPG, JPEG formats only

### 3. **Event Controller Updates** ✓
- **createEvent()**: Auto-upload main image and gallery during event creation
- **updateEvent()**: Replace old images with new ones (auto-deletes from Cloudinary)
- **deleteEvent()**: Auto-cleanup - deletes all images from Cloudinary when event is deleted

### 4. **Event Routes Updates** ✓
- Added multer upload middleware to:
  - `POST /events` - Create event with images
  - `PUT /events/:id` - Update event images
- Supports:
  - 1 main image (`image` field)
  - Up to 10 gallery images (`gallery` field)

### 5. **Image Storage** ✓
- EventModel already has:
  - `image: String` - Main event image URL
  - `gallery: [String]` - Array of gallery image URLs

---

## 🚀 How to Use

### **From Frontend (React)**

#### Create Event with Images:
```javascript
const formData = new FormData();
formData.append("title", "My Event");
formData.append("type", "Conference");
formData.append("date", "2024-06-15");
formData.append("time", "10:00 AM");
formData.append("capacity", 100);
formData.append("city", "New York");
formData.append("location", "Downtown");

// Add main image
formData.append("image", imageFile); // Single File object

// Add gallery images
formData.append("gallery", galleryImage1); // Multiple File objects
formData.append("gallery", galleryImage2);
formData.append("gallery", galleryImage3);

// Send to backend
const response = await axios.post(
  "http://localhost:1998/events",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`
    }
  }
);

console.log(response.data); // Returns: { event, imageUrl, status }
```

#### Update Event Images:
```javascript
const formData = new FormData();
formData.append("title", "Updated Event Title");
formData.append("image", newImageFile); // Optional

const response = await axios.put(
  "http://localhost:1998/events/eventId123",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`
    }
  }
);
```

---

## 🎯 Features

### ✅ Automatic Image Management
- Images uploaded to Cloudinary automatically
- Old images deleted when replaced
- All images deleted when event deleted
- No broken images or orphaned files

### ✅ Image Optimization
- Cloudinary auto-optimizes for web
- Automatic quality optimization
- Responsive image URLs available

### ✅ Folder Organization
- `qreventix/events/` - Main event images
- `qreventix/events/gallery/` - Gallery images

### ✅ Error Handling
- Validation for image types (PNG, JPG, JPEG only)
- File size limit: 30MB per file
- Graceful error messages
- Continues operations even if image deletion fails

---

## 📊 Image Flow

```
Frontend Form
    ↓
HTML File Input
    ↓
FormData with Files
    ↓
Multer Middleware (validates)
    ↓
uploadToCloudinary()
    ↓
Cloudinary Cloud
    ↓
Secure URLs stored in MongoDB
    ↓
Frontend displays images
```

---

## 🛡️ Image URLs

All images return as **secure HTTPS URLs**:
```
https://res.cloudinary.com/dum91ekf0/image/upload/...
```

Example in API Response:
```json
{
  "event": {
    "_id": "6757abc123...",
    "title": "Tech Conference 2024",
    "image": "https://res.cloudinary.com/dum91ekf0/image/upload/v1234567/qreventix/events/...",
    "gallery": [
      "https://res.cloudinary.com/dum91ekf0/image/upload/v1234567/qreventix/events/gallery/...",
      "https://res.cloudinary.com/dum91ekf0/image/upload/v1234567/qreventix/events/gallery/..."
    ]
  }
}
```

---

## 📝 API Endpoints

### Create Event with Images
```bash
POST /events
Content-Type: multipart/form-data
Authorization: Bearer {token}

Fields:
- image: File (optional)
- gallery: File[] (optional, up to 10)
- title, type, date, time, capacity, city, location (required)
```

### Update Event
```bash
PUT /events/{eventId}
Content-Type: multipart/form-data
Authorization: Bearer {token}

Fields:
- image: File (optional - replaces old image)
- gallery: File[] (optional - replaces all gallery)
- Other event fields (optional)
```

### Delete Event
```bash
DELETE /events/{eventId}
Authorization: Bearer {token}

✓ Automatically removes all images from Cloudinary
```

---

## ⚙️ Configuration Details

### Cloudinary Settings
```javascript
{
  folder: "qreventix",
  resource_type: "auto",
  quality: "auto"
}
```

### Multer Settings
```javascript
{
  storage: memory,
  limits: { fileSize: 1024 * 1024 * 30 }, // 30 MB
  fileFilter: PNG, JPG, JPEG only
}
```

---

## 🔍 Testing Checklist

- [ ] Create event with main image
- [ ] Create event with multiple gallery images
- [ ] Update event image (old image removed from Cloudinary)
- [ ] Update event gallery (old images removed)
- [ ] Delete event (all images removed from Cloudinary)
- [ ] Verify images display in event details page
- [ ] Check image URLs are HTTPS
- [ ] Test with different image formats

---

## 🎨 Frontend Integration

### Update AddProperty.jsx (Event Creation Form)
```javascript
// Add file input handlers
const [mainImage, setMainImage] = useState(null);
const [galleryImages, setGalleryImages] = useState([]);

// Handle file submission with FormData
const handleSubmitWithImages = async (formData) => {
  const data = new FormData();
  
  // Add text fields
  Object.keys(formData).forEach(key => {
    data.append(key, formData[key]);
  });
  
  // Add main image
  if (mainImage) {
    data.append("image", mainImage);
  }
  
  // Add gallery images
  galleryImages.forEach(img => {
    data.append("gallery", img);
  });
  
  // Send to API
  await eventApi.createEvent(data);
};
```

---

## 📦 Dependencies Used

- **cloudinary** (v2.9.0) - Image upload and management
- **multer** (v2.0.2) - File handling middleware
- **dotenv** (v17.2.3) - Environment variables

---

## 🎯 Next Steps

1. ✅ Cloudinary integration complete
2. Update frontend forms to include image uploads
3. Add image preview in event creation/edit forms
4. Display event images in PropertyCard.jsx
5. Display gallery in PropertyDetails.jsx

---

## ❓ Troubleshooting

### Images not uploading?
- Check Cloudinary credentials in `.env`
- Verify file format is PNG, JPG, or JPEG
- Ensure file size < 30MB
- Check backend console for upload errors

### Old images not deleting?
- Verify Cloudinary API secret is correct
- Check network connectivity to Cloudinary
- Images will be marked for async deletion (usually instant)

### CORS errors?
- Already configured in Server.js with WEB_URL
- Frontend and backend ports correctly set

---

## 📞 Support

Your Cloudinary configuration is production-ready!

**Cloud Name:** dum91ekf0
**Folder Structure:** qreventix/events/*, qreventix/events/gallery/*
**Max File Size:** 30 MB per image
**Formats Supported:** PNG, JPG, JPEG

