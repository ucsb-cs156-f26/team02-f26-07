import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function MenuItemReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const defaultValues = initialContents
    ? {
        ...initialContents,
        dateReviewed: initialContents.dateReviewed.replace("Z", ""),
      }
    : {};
  // Stryker restore all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues });
  // Stryker restore all

  const navigate = useNavigate();

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  const testIdPrefix = "MenuItemReviewForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="itemId">Item Id</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-itemId"}
          id="itemId"
          type="text"
          isInvalid={Boolean(errors.itemId)}
          {...register("itemId", {
            required: "Item Id is required.",
            //validate number
            // Stryker disable Regex
            pattern: {
              value: /^[0-9]+$/,
              message: "Item Id must be a number",
            },
            // Stryker restore Regex
            max: {
              value: 999999999,
              message: "Max value 999999999", //correct max?
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.itemId?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="reviewerEmail">Reviewer Email</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-reviewerEmail"}
          id="reviewerEmail"
          type="text"
          isInvalid={Boolean(errors.reviewerEmail)}
          {...register("reviewerEmail", {
            required: "Reviewer Email is required.",
            //validate format/valid email?
            // Stryker disable Regex
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Reviewer Email must be a valid email address",
            },
            // Stryker restore Regex
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.reviewerEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="stars">Stars</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-stars"}
          id="stars"
          type="text"
          isInvalid={Boolean(errors.stars)}
          {...register("stars", {
            required: "Stars is required.",
            //validate number
            pattern: {
              value: /^[0-9]+$/,
              message: "Stars must be a number",
            },
            //validate number is 0-5
            // min: {
            //   value: 0,
            //   message: "Stars must be between 0 and 5",
            // },
            max: {
              value: 5,
              message: "Stars must be between 0 and 5",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.stars?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateReviewed">
          Date Reviewed (iso format)
        </Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateReviewed"}
          id="dateReviewed"
          type="datetime-local"
          isInvalid={Boolean(errors.dateReviewed)}
          {...register("dateReviewed", {
            required: "Date Reviewed is required.",
            // Stryker disable all
            pattern: {
              value: isodate_regex,
              message: "Date Reviewed must be in ISO format",
            },
            // Stryker restore all
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateReviewed?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="comments">Comments</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-comments"}
          id="comments"
          type="text"
          isInvalid={Boolean(errors.comments)}
          {...register("comments", {
            required: "Comments is required.",
            maxLength: {
              value: 255,
              message: "Max length 255 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.comments?.message}
        </Form.Control.Feedback>
      </Form.Group>
      
      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
          {buttonLabel}
      </Button>
      {/* <Button type="submit">{buttonLabel}</Button> */}
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default MenuItemReviewForm;
