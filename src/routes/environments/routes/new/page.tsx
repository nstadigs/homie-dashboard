import * as environments from "../../../../state/environmentConfigs.ts";
import { useNavigate } from "react-router";
import { EnvironmentForm } from "../../components/EnvironmentForm.tsx";

export function NewEnvironmentPage() {
  const navigate = useNavigate();

  return (
    <EnvironmentForm
      legend="Add a new Homie environment"
      onSubmit={(environmentData) => {
        const result = environments.add(environmentData);

        if (result.success) {
          navigate(`/`);
        }

        return result;
      }}
    />
  );
}
