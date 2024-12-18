import * as environments from "../../../../state/environmentConfigs.ts";
import { useNavigate, useParams } from "react-router";
import { EnvironmentForm } from "../../components/EnvironmentForm.tsx";

export function EditEnvironmentPage() {
  const { environmentId } = useParams();
  const navigate = useNavigate();

  if (environmentId == null) {
    return;
  }

  const environment = environments.useEnvironmentConfig(environmentId);

  if (environment == null) {
    return "Not found";
  }

  return (
    <EnvironmentForm
      legend="Edit Environment"
      defaultValues={environment}
      onSubmit={(environmentData) => {
        const result = environments.set(environmentId, environmentData);

        if (result.success) {
          navigate(`../../`);
        }

        return result;
      }}
    />
  );
}
