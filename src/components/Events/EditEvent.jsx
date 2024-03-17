import {
  Link,
  useNavigate,
  useParams,
  redirect,
  useSubmit,
  useNavigation
} from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";

import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const {state} = useNavigation()
  const submit = useSubmit();
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: id }),
    staleTime: 10000
  });

  /*   const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ["events", id] });
      const previousEvent = queryClient.getQueryData(["events", id]);

      queryClient.setQueryData(["events", id], newEvent);

      return { previousEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", id]);
    },
  }); */

  function handleSubmit(formData) {
    /*  mutate({ id: id, event: formData });
    navigate("../"); */
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title={"Failed to load event"}
          message={error.info?.message || "Pleace try later"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            OK
          </Link>
        </div>
      </>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? <p>Sending data...</p> : <>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
        </>}
       
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  const id = params.id;
  return queryClient.fetchQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatetFormData = Object.fromEntries(formData);

  await updateEvent({ id: params.id, event: updatetFormData });
  await queryClient.invalidateQueries(["events"]);

  return redirect("../");
}
