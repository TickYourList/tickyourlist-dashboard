import React from 'react';
import {
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { deleteCollection } from 'store/collections/action';
import { useNavigate } from 'react-router-dom';

function CollectionTile({ _id, name, icon, color, image, productIds, carModelIds, isMutable }) {
  const dispatch = useDispatch();
  const history = useNavigate();

  const handleCollectionDelete = (event) => {
    event.stopPropagation();
    dispatch(deleteCollection(_id));
  };

  const handleUpdateImageClick = (event) => {
    event.stopPropagation(); // Prevent triggering parent click events
    console.log('Update Image Clicked');
  };

  const handleCardClick = () => {
    history(`/automobile-collection-details/${_id}`);
  };

  return (
    <div className="col-4 pt-4">
      <div
        className={`${color ? '' : 'bg-secondary '} rounded d-flex flex-column justify-content-between text-white`}
        style={{ minHeight: '280px', background: color, cursor: 'pointer' }}
        onClick={handleCardClick}
      >
        <Row>
          <Col className="text-sm-end m-3 mx-4">
            <UncontrolledDropdown direction="left">
              <DropdownToggle
                tag={Button}
                className="card-drop"
                color="link"
                onClick={(event) => event.stopPropagation()}
              >
                <i className="mdi mdi-dots-horizontal mdi-24px text-white" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem
                  tag={Button}
                  color="link"
                  onClick={handleCardClick}
                >
                  <i className="mdi mdi-file-image me-3" />
                  Update Image
                </DropdownItem>
                {_id !== 'all-products' ? (
                  <DropdownItem
                    tag={Button}
                    color="link"
                    onClick={handleCollectionDelete}
                  >
                    <i className="fas fa-trash-alt me-3" />
                    Delete
                  </DropdownItem>
                ) : null}
              </DropdownMenu>
            </UncontrolledDropdown>
          </Col>
        </Row>
        <div className="p-2 mx-3 font-size-18">
          <span>{name}</span>
          {productIds && productIds.length > 0 ? (
            <span className="mx-2">{productIds.length}</span>
          ) : carModelIds && carModelIds.length > 0 ? (
            <span className="mx-2">{carModelIds.length}</span>
          ) : ''}
        </div>
      </div>
    </div>
  );
}

CollectionTile.propTypes = {
  _id: PropTypes.string,
  isMutable: PropTypes.bool,
  name: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  image: PropTypes.any,
  productIds: PropTypes.array,
};

export default CollectionTile;
