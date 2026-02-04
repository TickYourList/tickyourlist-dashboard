import React from "react";
import { Formik, Form, FieldArray } from "formik";
import { Button, Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { addNewBanner } from "store/banners/bannerActions";
import { useDispatch } from "react-redux"
import * as Yup from "yup"
import BannerFormRow from "./BannerFormRow"; 

const emptyBannerRow = {
  bannerType: "city",
  cityCode: "",
  tourId: "",
  categoryId: "",
  subcategoryId: "",
  bannerCollectionId: "",
  title: "",
  subtitle: "",
  buttonText: "",
  sortOrder: 0,
  status: true,
  mediaFile: null,
  phoneViewMediaFile: null,
};

const resolveProductSelection = banner => {
  if (banner.tourId) return { productId: banner.tourId, productType: "TylTourGroup" };
  if (banner.categoryId) return { productId: banner.categoryId, productType: "TylTravelCategory" };
  if (banner.subcategoryId) return { productId: banner.subcategoryId, productType: "TylTravelSubCategory" };
  if (banner.bannerCollectionId) return { productId: banner.bannerCollectionId, productType: "TylTravelCollection" };
  return { productId: null, productType: null };
};

const bannerValidationSchema = Yup.object({
  banners: Yup.array()
    .of(
      Yup.object()
        .shape({
          bannerType: Yup.string()
            .oneOf(["city", "worldwide"])
            .required("Banner type is required."),
          cityCode: Yup.string().when("bannerType", (bannerType, schema) =>
            bannerType === "city"
              ? schema.required("A city must be selected for city banners.")
              : schema.notRequired(),
          ),
          mediaFile: Yup.mixed()
            .required("Web view media file is required.")
            .nullable(),
          phoneViewMediaFile: Yup.mixed()
            .required("Phone view media file is required.")
            .nullable(),
          sortOrder: Yup.number()
            .typeError("Sort order must be a number.")
            .min(0, "Sort order must be 0 or more.")
            .required("Sort order is required."),
        })
        .test(
          "target-required-for-city",
          "Select Tour, Category, Subcategory, or Banner Collection for city banners.",
          value => {
            if (!value || value.bannerType !== "city") return true;
            return Boolean(
              value.tourId ||
              value.categoryId ||
              value.subcategoryId ||
              value.bannerCollectionId,
            );
          },
        ),
    )
    .min(1, "At least one banner row is required.")
    .test(
      "single-worldwide-group",
      "Only one worldwide banner group can be created per submit.",
      rows => (rows || []).filter(row => row.bannerType === "worldwide").length <= 1,
    ),
});
  
const AddBannerForm = ({ onCancel }) => {
  const dispatch = useDispatch()
  const initialValues = {
    banners: [{ ...emptyBannerRow }],
  };

  const handleSubmit = (values, { resetForm }) => {
    const rows = values.banners || [];
    const homeRows = rows.filter(row => row.bannerType === "worldwide");
    const cityRows = rows.filter(row => row.bannerType === "city");

    if (homeRows.length > 0) {
      dispatch(
        addNewBanner({
          isHomeScreen: true,
          status: homeRows.every(row => row.status !== false),
          slides: homeRows.map((row, index) => ({
            title: row.title || undefined,
            subtitle: row.subtitle || undefined,
            buttonText: row.buttonText || undefined,
            sortOrder: Number.isFinite(Number(row.sortOrder)) ? Number(row.sortOrder) : index,
          })),
          medias: homeRows.map(row => row.mediaFile),
          phoneViewMedias: homeRows.map(row => row.phoneViewMediaFile),
        }),
      );
    }

    const cityRowsByCode = cityRows.reduce((acc, row) => {
      if (!acc[row.cityCode]) acc[row.cityCode] = [];
      acc[row.cityCode].push(row);
      return acc;
    }, {});

    Object.keys(cityRowsByCode).forEach(cityCode => {
      const groupedRows = cityRowsByCode[cityCode];
      const slides = groupedRows.map((row, index) => {
        const { productId, productType } = resolveProductSelection(row);
        return {
          productId,
          productType,
          title: row.title || undefined,
          subtitle: row.subtitle || undefined,
          buttonText: row.buttonText || undefined,
          sortOrder: Number.isFinite(Number(row.sortOrder)) ? Number(row.sortOrder) : index,
        };
      });

      dispatch(
        addNewBanner({
          isHomeScreen: false,
          cityCode,
          status: groupedRows.every(row => row.status !== false),
          slides,
          medias: groupedRows.map(row => row.mediaFile),
          phoneViewMedias: groupedRows.map(row => row.phoneViewMediaFile),
        }),
      );
    });

    resetForm({ values: { banners: [{ ...emptyBannerRow }] } });
    onCancel();
  };

  return (
    <Card>
      <CardHeader><h4 className="card-title mb-0">Add New Banners</h4></CardHeader>
      <CardBody>
        <Formik initialValues={initialValues} validationSchema={bannerValidationSchema} onSubmit={handleSubmit}>
          {({ values, setFieldValue, setFieldTouched, errors, touched }) => (
            <Form>
              <FieldArray name="banners">
                {({ push, remove }) => (
                  <div>
                    {values.banners.map((banner, index) => (
                      <Row key={index} className="align-items-center mb-3">
                        <Col>
                          <BannerFormRow
                            index={index}
                            values={values}
                            setFieldValue={setFieldValue}
                            errors={errors}
                            touched={touched}
                            setFieldTouched={setFieldTouched}
                          />
                        </Col>
                        <Col xs="auto" className="align-self-end mb-3">
                          <Button type="button" color="danger" onClick={() => remove(index)}>Delete</Button>
                        </Col>
                      </Row>
                    ))}
                    <Button type="button" color="success" onClick={() => push({ ...emptyBannerRow })}>
                      Add Another Banner
                    </Button>
                  </div>
                )}
              </FieldArray>
              <hr className="my-4" />
              <Button type="submit" color="primary">Submit Banners</Button>
              <Button type="button" color="secondary" className="ms-2" onClick={onCancel}>Cancel</Button>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
};

export default AddBannerForm;
