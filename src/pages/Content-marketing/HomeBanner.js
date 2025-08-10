import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import TableContainer from "components/Common/TableContainer";
import Breadcrumbs from "components/Common/Breadcrumb";
import { getBanners } from "store/banners/bannerActions";
import { Card, CardBody, Container, Row, Col, Button, Input, Dropdown,
  DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import paginationFactory from "react-bootstrap-table2-paginator";
import { deleteBanner } from "store/banners/bannerActions";
import AddBannerForm from "./AddBannerForm";
import EditBannerForm from "./EditBannerForm";
import BannerDetailsView from './BannerDetailsView'
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";


// Table columns
const Preview = ({ row, onPreviewClick }) => {
  const { preview, type } = row.original;

  if (!preview) return <span>No Media</span>;

  // Added a wrapper div with onClick and a pointer cursor
  return (
    <div onClick={() => onPreviewClick(row.original)} style={{ cursor: 'pointer' }}>
      {type === "video" ? (
        <video width={100} height={50} style={{ borderRadius: 4 }}>
          <source src={preview} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={preview}
          alt={row.original.cityCode}
          style={{ width: 100, height: 50, objectFit: "cover", borderRadius: 4 }}
        />
      )}
    </div>
  );
};


const cityCode = ({ row }) => <span>{row.original.cityCode}</span>;

const BannerType = ({ row }) => (
  <span>{row.original.bannerType}</span>
);

const Status = ({ row }) => (
  <span className={`badge bg-${row.original.status === "Active" ? "success" : "secondary"}`}>
    {row.original.status}
  </span>
);

const ViewDetails = ({ row, onView }) => (
  <Button color="info" size="sm" onClick={() => onView(row.original)}>
    View Details
  </Button>
);



const Actions = ({ row, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prevState => !prevState);

  return (
    <Dropdown isOpen={isOpen} toggle={toggle} direction="left">
      <DropdownToggle tag="button" className="btn btn-lg btn-icon bg-white border-0">
        <i className="mdi mdi-dots-horizontal"></i>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => onEdit(row.original)}>
          <i className="mdi mdi-pencil me-2 text-success"></i> Edit
        </DropdownItem>
        <DropdownItem onClick={() => onDelete(row.original)}>
          <i className="mdi mdi-trash-can-outline me-2 text-danger"></i> Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};



function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach(row => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <Input
      type="select"
      value={filterValue || ''}
      onClick={(e) => e.stopPropagation()}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      bsSize="sm"
    >
      <option value="">All</option>
      
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </Input>
  );
}

const BannerColumns = (onEdit, onDelete, onView, onPreviewClick) => [
  { 
    Header: 'Preview', 
    accessor: 'preview', 
    disableFilters: true,
    Cell: ({ row }) => <Preview row={row} onPreviewClick={onPreviewClick} /> 
  },
  { 
    Header: 'City Name', 
    accessor: 'cityCode', 
    Cell: ({ row }) => cityCode({ row }) 
  },
  { 
    Header: 'Banner Type', 
    accessor: 'bannerType', 
    Filter: SelectColumnFilter, 
    filter: 'exactText',
    Cell: ({ row }) => BannerType({ row }) 
  },
  { 
    Header: 'Status', 
    accessor: 'status', 
    Filter: SelectColumnFilter, 
    filter: 'exactText',
    Cell: ({ row }) => <Status row={row} /> 
  },
  { 
    Header: 'View Banner Details', 
    accessor: 'view', 
    disableFilters: true,
    Cell: ({ row }) => <ViewDetails row={row} onView={onView} /> 
  },
  { 
    Header: 'Action', 
    accessor: 'actions',
    disableFilters: true,
    Cell: ({ row }) => <Actions row={row} onEdit={onEdit} onDelete={onDelete} /> 
  },
];

const HomeBanner = () => {
  document.title = "Home Banners | Content & Marketing";
  const dispatch = useDispatch();
  
  
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, banner: null });
  const [modal, setModal] = useState({ type: null, isOpen: false });
  
  const [lightboxIsOpen, setLightboxIsOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxVideo, setLightboxVideo] = useState("");

  const { banners, loading, error } = useSelector(state => state.banner);

  useEffect(() => {
    dispatch(getBanners());
  }, [dispatch]);

  const handleOpenModal = (type, banner = null) => {
    setSelectedBanner(banner); 
    setModal({ type: type, isOpen: true })
  }

  const handleCloseModal = () => {
  setModal({ type: null, isOpen: false }); 
  setSelectedBanner(null)
}

const handleDelete = (banner) => {
  setDeleteModal({ isOpen: true, banner: banner });
}

const confirmDelete = () => {
  if (deleteModal.banner) {
    dispatch(deleteBanner(deleteModal.banner._id));
    
  }
  setDeleteModal({ isOpen: false, banner: null }); 
};


 const handlePreviewClick = (banner) => {
  
  if (banner.type !== 'video') {
    setLightboxImage(banner.preview);
    setLightboxIsOpen(true);
  }
};

const data = useMemo(() => {
  if (!Array.isArray(banners)) return [];

  return banners.map(banner => {
    
    return {
      ...banner,
      id: banner._id || Math.random().toString(36).substring(2),
      preview: banner.phoneViewMedia?.url || banner.media?.url || '',
      media: banner.media,
      phoneViewMedia: banner.phoneViewMedia,
      type: banner.type || 'image',
      cityCode: banner.cityCode || banner.cityCode || '—',
      bannerType: banner.isHomeScreen ? 'Worldwide' : 'City',
      status: "Active",
      details: banner,
      actions: banner,
      
    };
  });
}, [banners]);


 

return (
  <React.Fragment>
    {lightboxIsOpen && (
        <Lightbox
          mainSrc={lightboxImage}
          mainSrcThumbnail={lightboxImage}
          videoSrc={lightboxVideo}
          onCloseRequest={() => {
            setLightboxIsOpen(false);
            setLightboxImage("");
            setLightboxVideo("");
          }}
        />
      )}
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Banners" breadcrumbItem="Content & Marketing" />
        
        {/* --- Main Conditional Logic for Add/Edit/View --- */}

        {isAdding ? (
          <AddBannerForm onCancel={() => setIsAdding(false)} />
        ) : selectedBanner && modal.type !== 'edit' ? (
          <BannerDetailsView 
            banner={selectedBanner}
            onBack={() => setSelectedBanner(null)} 
          />
        ) : (
          // --- Default Table View ---
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  {/* --- Top Control Bar --- */}
                  <Row className="mb-3">
                    <Col sm={4}>
                      <div className="d-flex align-items-center">
                        <h4 className="card-title mb-0 flex-grow-1">Home Banners</h4>
                      </div>
                    </Col>
                    <Col sm={8}>
                      <div className="d-flex flex-wrap justify-content-sm-end gap-2">
                        <Button color="primary" onClick={() => setIsAdding(true)}>
                           + Add New Banner
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* --- Table Container --- */}
                  <TableContainer
                    columns={BannerColumns(
                      (banner) => handleOpenModal('edit', banner),
                      handleDelete,
                      (banner) => setSelectedBanner(banner),
                      handlePreviewClick,
                    )}
                    data={data}
                    isGlobalFilter={false}
                    
                    customPageSize={10}
                    pagination={paginationFactory({ sizePerPage: 10, showTotal: true })}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* --- Modals (remain outside the main logic) --- */}
      <EditBannerForm
        isOpen={modal.type === 'edit' && modal.isOpen}
        toggle={handleCloseModal}
        banner={selectedBanner}
      />
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        toggle={() => setDeleteModal({ isOpen: false, banner: null })}
        banner={deleteModal.banner}
        onDelete={confirmDelete}
      />
    </div>
  </React.Fragment>
);
};

export default HomeBanner;