import React from "react"
import { Button, Card, CardBody, Col, Input, Label, Row } from "reactstrap"
import CreatableSelect from "react-select/creatable"

/**
 * Structured itinerary editor for tour groups (optional section).
 *
 * Mirrors the backend Itinerary shape: { totalDuration, transferModes[],
 * steps[] } where each step supports all 10 step types plus description,
 * duration/time, link, transport legs, highlights, tags, location and media.
 * Existing images live in step.images (kept unless removed here); freshly
 * picked files go to step.newImages / step.newVideos and are uploaded as
 * multipart fields named step_{order}_image_{i} / step_{order}_video_{i}.
 */

export const STEP_TYPES = [
  { value: "START", label: "Start Point" },
  { value: "STOP", label: "Stop" },
  { value: "PASS_BY", label: "Passes By" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "FREE_TIME", label: "Free Time" },
  { value: "OVERNIGHT", label: "Overnight Stay" },
  { value: "CHECKIN", label: "Check-in" },
  { value: "CHECKOUT", label: "Check-out" },
  { value: "END", label: "End Point" },
]

export const emptyItineraryStep = stepType => ({
  stepType: stepType || "STOP",
  title: "",
  description: "",
  duration: "",
  time: "",
  link: { text: "", url: "" },
  transport: [],
  highlights: [],
  tags: [],
  location: {
    addressLine1: "",
    cityName: "",
    countryCode: "",
    latitude: "",
    longitude: "",
  },
  images: [],
  videos: [],
  newImages: [],
  newVideos: [],
})

// tourGroup.itinerary (API shape) -> form state used by this builder
export const itineraryToFormValue = itinerary => {
  if (!itinerary || !Array.isArray(itinerary.steps) || !itinerary.steps.length)
    return null
  const sorted = [...itinerary.steps].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  )
  return {
    totalDuration: itinerary.totalDuration || "",
    transferModes: itinerary.transferModes || [],
    steps: sorted.map(s => ({
      ...emptyItineraryStep(s.stepType),
      title: s.title || "",
      description: s.description || "",
      duration: s.duration || "",
      time: s.time || "",
      link: { text: s.link?.text || "", url: s.link?.url || "" },
      transport: (s.transport || []).map(t => ({
        mode: t?.mode || "",
        details: t?.details || "",
      })),
      highlights: s.highlights || [],
      tags: s.tags || [],
      location: {
        addressLine1: s.location?.addressLine1 || "",
        cityName: s.location?.cityName || "",
        countryCode: s.location?.countryCode || "",
        latitude: s.location?.latitude ?? "",
        longitude: s.location?.longitude ?? "",
      },
      images: s.images || [],
      videos: s.videos || [],
    })),
  }
}

// form state -> JSON payload the backend create/update routes expect
export const itineraryToPayload = itinerary => {
  if (!itinerary || !Array.isArray(itinerary.steps) || !itinerary.steps.length)
    return null
  return {
    totalDuration: itinerary.totalDuration || "",
    transferModes: (itinerary.transferModes || []).filter(Boolean),
    steps: itinerary.steps.map((s, idx) => {
      const step = {
        stepType: s.stepType || "STOP",
        title: (s.title || "").trim(),
        order: idx,
        images: (s.images || []).filter(img => img && img.url),
        videos: (s.videos || []).filter(v => v && v.url),
      }
      if (s.description) step.description = s.description
      if (s.duration) step.duration = s.duration
      if (s.time) step.time = s.time
      if (s.link?.text && s.link?.url)
        step.link = { text: s.link.text, url: s.link.url }
      const transport = (s.transport || []).filter(t => t && t.mode)
      if (transport.length)
        step.transport = transport.map(t => ({
          mode: t.mode,
          ...(t.details ? { details: t.details } : {}),
        }))
      const highlights = (s.highlights || []).filter(Boolean)
      if (highlights.length) step.highlights = highlights
      const tags = (s.tags || []).filter(Boolean)
      if (tags.length) step.tags = tags
      const loc = s.location || {}
      const location = {}
      if (loc.addressLine1) location.addressLine1 = loc.addressLine1
      if (loc.cityName) location.cityName = loc.cityName
      if (loc.countryCode) location.countryCode = loc.countryCode
      if (loc.latitude !== "" && loc.latitude !== null && loc.latitude !== undefined && !isNaN(Number(loc.latitude)))
        location.latitude = Number(loc.latitude)
      if (loc.longitude !== "" && loc.longitude !== null && loc.longitude !== undefined && !isNaN(Number(loc.longitude)))
        location.longitude = Number(loc.longitude)
      if (Object.keys(location).length) step.location = location
      return step
    }),
  }
}

// Appends freshly picked step media files; backend matches them to steps by
// the step_{order}_image_ / step_{order}_video_ filename prefix.
export const appendItineraryFiles = (formData, itinerary) => {
  if (!itinerary || !Array.isArray(itinerary.steps)) return
  itinerary.steps.forEach((s, idx) => {
    ;(s.newImages || []).forEach((file, i) => {
      if (file instanceof File)
        formData.append(
          "itineraryStepImages",
          file,
          `step_${idx}_image_${i}_${file.name}`
        )
    })
    ;(s.newVideos || []).forEach((file, i) => {
      if (file instanceof File)
        formData.append(
          "itineraryStepVideos",
          file,
          `step_${idx}_video_${i}_${file.name}`
        )
    })
  })
}

const toOptions = arr => (arr || []).map(v => ({ value: v, label: v }))

export default function ItineraryBuilder({ value, onChange }) {
  const itinerary = value

  const update = patch => onChange({ ...itinerary, ...patch })

  const updateStep = (idx, patch) => {
    const steps = itinerary.steps.map((s, i) =>
      i === idx ? { ...s, ...patch } : s
    )
    update({ steps })
  }

  const addStep = () => {
    if (!itinerary) {
      onChange({
        totalDuration: "",
        transferModes: [],
        steps: [emptyItineraryStep("START")],
      })
      return
    }
    update({ steps: [...itinerary.steps, emptyItineraryStep()] })
  }

  const removeStep = idx =>
    update({ steps: itinerary.steps.filter((_, i) => i !== idx) })

  const moveStep = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= itinerary.steps.length) return
    const steps = [...itinerary.steps]
    ;[steps[idx], steps[target]] = [steps[target], steps[idx]]
    update({ steps })
  }

  if (!itinerary || !itinerary.steps?.length) {
    return (
      <div className="border rounded p-3 bg-light">
        <p className="text-muted mb-2">
          No itinerary added. Itineraries are optional, but multi-stop
          experiences (e.g. Cappadocia Red/Green tours) convert better with
          one.
        </p>
        <Button color="primary" size="sm" type="button" onClick={addStep}>
          + Add First Step
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Row className="mb-3">
        <Col md={4}>
          <Label className="form-label">Total Duration</Label>
          <Input
            type="text"
            placeholder="e.g. 8 hours"
            value={itinerary.totalDuration}
            onChange={e => update({ totalDuration: e.target.value })}
          />
        </Col>
        <Col md={8}>
          <Label className="form-label">Modes of Transfer</Label>
          <CreatableSelect
            isMulti
            placeholder="Type and press enter — e.g. A/C Bus, Hot Air Balloon"
            value={toOptions(itinerary.transferModes)}
            onChange={opts =>
              update({ transferModes: (opts || []).map(o => o.value) })
            }
          />
        </Col>
      </Row>

      {itinerary.steps.map((step, idx) => (
        <Card key={idx} className="mb-3 border">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                Step {idx + 1}
                {step.title ? ` — ${step.title}` : ""}
              </h6>
              <div>
                <Button
                  color="light"
                  size="sm"
                  type="button"
                  className="me-1"
                  disabled={idx === 0}
                  onClick={() => moveStep(idx, -1)}
                >
                  ↑
                </Button>
                <Button
                  color="light"
                  size="sm"
                  type="button"
                  className="me-1"
                  disabled={idx === itinerary.steps.length - 1}
                  onClick={() => moveStep(idx, 1)}
                >
                  ↓
                </Button>
                <Button
                  color="danger"
                  size="sm"
                  type="button"
                  onClick={() => removeStep(idx)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <Row className="mb-2">
              <Col md={3}>
                <Label className="form-label">Step Type</Label>
                <Input
                  type="select"
                  value={step.stepType}
                  onChange={e => updateStep(idx, { stepType: e.target.value })}
                >
                  {STEP_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md={5}>
                <Label className="form-label">Title *</Label>
                <Input
                  type="text"
                  placeholder="e.g. Göreme Open Air Museum"
                  value={step.title}
                  invalid={!step.title.trim()}
                  onChange={e => updateStep(idx, { title: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Label className="form-label">Duration</Label>
                <Input
                  type="text"
                  placeholder="e.g. 45 mins"
                  value={step.duration}
                  onChange={e => updateStep(idx, { duration: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Label className="form-label">Time</Label>
                <Input
                  type="text"
                  placeholder="e.g. 09:30 AM"
                  value={step.time}
                  onChange={e => updateStep(idx, { time: e.target.value })}
                />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Label className="form-label">Description</Label>
                <Input
                  type="textarea"
                  rows={2}
                  value={step.description}
                  onChange={e =>
                    updateStep(idx, { description: e.target.value })
                  }
                />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md={6}>
                <Label className="form-label">Highlights</Label>
                <CreatableSelect
                  isMulti
                  placeholder="e.g. Fairy chimneys, Cave churches"
                  value={toOptions(step.highlights)}
                  onChange={opts =>
                    updateStep(idx, {
                      highlights: (opts || []).map(o => o.value),
                    })
                  }
                />
              </Col>
              <Col md={6}>
                <Label className="form-label">Tags</Label>
                <CreatableSelect
                  isMulti
                  placeholder="e.g. UNESCO, Photo stop"
                  value={toOptions(step.tags)}
                  onChange={opts =>
                    updateStep(idx, { tags: (opts || []).map(o => o.value) })
                  }
                />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col md={6}>
                <Label className="form-label">Link Text</Label>
                <Input
                  type="text"
                  placeholder="e.g. View on map"
                  value={step.link.text}
                  onChange={e =>
                    updateStep(idx, {
                      link: { ...step.link, text: e.target.value },
                    })
                  }
                />
              </Col>
              <Col md={6}>
                <Label className="form-label">Link URL</Label>
                <Input
                  type="text"
                  placeholder="https://…"
                  value={step.link.url}
                  onChange={e =>
                    updateStep(idx, {
                      link: { ...step.link, url: e.target.value },
                    })
                  }
                />
              </Col>
            </Row>
            {((step.link.text && !step.link.url) ||
              (!step.link.text && step.link.url)) && (
              <p className="text-danger small mb-2">
                Link needs both text and URL to be saved.
              </p>
            )}

            <Label className="form-label mb-1">Transport to this step</Label>
            {step.transport.map((t, ti) => (
              <Row className="mb-2" key={ti}>
                <Col md={4}>
                  <Input
                    type="text"
                    placeholder="Mode * — e.g. A/C Bus, Walk, ATV"
                    value={t.mode}
                    onChange={e => {
                      const transport = step.transport.map((x, i) =>
                        i === ti ? { ...x, mode: e.target.value } : x
                      )
                      updateStep(idx, { transport })
                    }}
                  />
                </Col>
                <Col md={6}>
                  <Input
                    type="text"
                    placeholder="Details — e.g. 20 min ride from hotel"
                    value={t.details}
                    onChange={e => {
                      const transport = step.transport.map((x, i) =>
                        i === ti ? { ...x, details: e.target.value } : x
                      )
                      updateStep(idx, { transport })
                    }}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    color="light"
                    size="sm"
                    type="button"
                    onClick={() =>
                      updateStep(idx, {
                        transport: step.transport.filter((_, i) => i !== ti),
                      })
                    }
                  >
                    ×
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              color="light"
              size="sm"
              type="button"
              className="mb-2"
              onClick={() =>
                updateStep(idx, {
                  transport: [...step.transport, { mode: "", details: "" }],
                })
              }
            >
              + Add Transport
            </Button>

            <Row className="mb-2">
              <Col md={4}>
                <Label className="form-label">Address</Label>
                <Input
                  type="text"
                  value={step.location.addressLine1}
                  onChange={e =>
                    updateStep(idx, {
                      location: {
                        ...step.location,
                        addressLine1: e.target.value,
                      },
                    })
                  }
                />
              </Col>
              <Col md={3}>
                <Label className="form-label">City</Label>
                <Input
                  type="text"
                  value={step.location.cityName}
                  onChange={e =>
                    updateStep(idx, {
                      location: { ...step.location, cityName: e.target.value },
                    })
                  }
                />
              </Col>
              <Col md={1}>
                <Label className="form-label">Country</Label>
                <Input
                  type="text"
                  placeholder="TR"
                  value={step.location.countryCode}
                  onChange={e =>
                    updateStep(idx, {
                      location: {
                        ...step.location,
                        countryCode: e.target.value,
                      },
                    })
                  }
                />
              </Col>
              <Col md={2}>
                <Label className="form-label">Latitude</Label>
                <Input
                  type="number"
                  value={step.location.latitude}
                  onChange={e =>
                    updateStep(idx, {
                      location: { ...step.location, latitude: e.target.value },
                    })
                  }
                />
              </Col>
              <Col md={2}>
                <Label className="form-label">Longitude</Label>
                <Input
                  type="number"
                  value={step.location.longitude}
                  onChange={e =>
                    updateStep(idx, {
                      location: {
                        ...step.location,
                        longitude: e.target.value,
                      },
                    })
                  }
                />
              </Col>
            </Row>

            {step.images.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-2">
                {step.images.map((img, ii) => (
                  <div key={ii} className="position-relative">
                    <img
                      src={img.url}
                      alt={img.altText || ""}
                      style={{
                        width: 90,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <Button
                      color="danger"
                      size="sm"
                      type="button"
                      className="position-absolute top-0 end-0 p-0 px-1"
                      title="Remove image"
                      onClick={() =>
                        updateStep(idx, {
                          images: step.images.filter((_, i) => i !== ii),
                        })
                      }
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Row>
              <Col md={6}>
                <Label className="form-label">Add Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e =>
                    updateStep(idx, { newImages: Array.from(e.target.files) })
                  }
                />
                {step.newImages.length > 0 && (
                  <small className="text-muted">
                    {step.newImages.length} new image(s) will be uploaded
                  </small>
                )}
              </Col>
              <Col md={6}>
                <Label className="form-label">Add Videos</Label>
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={e =>
                    updateStep(idx, { newVideos: Array.from(e.target.files) })
                  }
                />
                {(step.videos.length > 0 || step.newVideos.length > 0) && (
                  <small className="text-muted">
                    {step.videos.length} existing,{" "}
                    {step.newVideos.length} new video(s)
                  </small>
                )}
              </Col>
            </Row>
          </CardBody>
        </Card>
      ))}

      <div className="d-flex gap-2">
        <Button color="primary" size="sm" type="button" onClick={addStep}>
          + Add Step
        </Button>
        <Button
          color="outline-danger"
          size="sm"
          type="button"
          onClick={() => onChange(null)}
        >
          Remove Entire Itinerary
        </Button>
      </div>
    </div>
  )
}
