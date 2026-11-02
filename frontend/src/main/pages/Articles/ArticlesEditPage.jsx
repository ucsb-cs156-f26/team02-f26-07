import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ArticlesEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: article,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/Articles?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default
      method: "GET",
      url: "/api/Articles",
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (article) => ({
    url: "/api/Articles",
    method: "PUT",
    params: {
      id: article.id,
    },
    data: {
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      title: article.title,
      dateAdded: article.dateAdded,
    },
  });

  const onSuccess = (article) => {
    toast(`Article Updated - id: ${article.id} title: ${article.title}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to test query caching
    ["/api/Articles/all"],
  );

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess && !storybook) {
    return <Navigate to="/articles" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Article</h1>
        {article && (
          <ArticlesForm
            initialContents={article}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
