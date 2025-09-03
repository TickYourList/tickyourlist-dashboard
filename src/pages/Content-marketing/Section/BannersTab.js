import React, { useEffect, useState, useMemo } from "react";


import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button } from "reactstrap";
import { getBannerList } from "helpers/backend_helper";



const BannersTab = ({ sectionData }) => {
  const [bannerGroups, setBannerGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBannerList()
      .then(response => {
        setBannerGroups(response.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch all banners", error);
        setLoading(false);
      });
  }, []);

  const sectionSlides = useMemo(() => {
    if (!bannerGroups.length || !sectionData?.cityCode) {
      return [];
    }
    const group = bannerGroups.find(
      g => g.cityCode === sectionData.cityCode
    );
    return group?.slides || [];
  }, [bannerGroups, sectionData]);

  if (loading) {
    return <div className="text-center p-4"></div>;
  }

  return (
    <div>
      {/* --- Web View Section --- */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4>Web View Banner</h4>
          <Button outline color="primary" size="sm">
            <i className="mdi mdi-pencil me-1"></i> Edit
          </Button>
        </div>
        {sectionSlides.length > 0 ? (
          
          <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows autoPlay>
            {sectionSlides.map(slide => (
              <div key={slide._id + '-web'}>
                <img 
                  src={slide.media?.url} 
                  alt={slide.media?.altText || 'Web Banner'} 
                  style={{ maxHeight: '300px', objectFit: 'contain' }} 
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <p className="text-muted">No web banners found for this section.</p>
        )}
      </div>

      <hr />

      {/* --- Phone View Section --- */}
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4>Phone View Banner</h4>
          <Button outline color="primary" size="sm">
            <i className="mdi mdi-pencil me-1"></i> Edit
          </Button>
        </div>
        {sectionSlides.length > 0 ? (
          
          <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows autoPlay>
            {sectionSlides.map(slide => (
              <div key={slide._id + '-phone'}>
                <img 
                  src={slide.phoneViewMedia?.url} 
                  alt={slide.phoneViewMedia?.altText || 'Phone Banner'} 
                  style={{ maxHeight: '300px', objectFit: 'contain' }} 
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <p className="text-muted">No phone banners found for this section.</p>
        )}
      </div>
    </div>
  );
};

export default BannersTab;