import os
from ddtrace.llmobs import LLMObs

# Set up credentials. Generate keys at:
#   https://us5.datadoghq.com/organization-settings/api-keys
#   https://us5.datadoghq.com/organization-settings/application-keys
API_KEY = os.getenv("DD_API_KEY", "YOUR_API_KEY")
APP_KEY = os.getenv("DD_APP_KEY", "YOUR_APP_KEY")
SITE = os.getenv("DD_SITE", "us5.datadoghq.com")
PROJECT = os.getenv("DD_LLMOBS_PROJECT_NAME", "default-project")

print("====================================================================")
print("  DATADOG LLMOBS EXPERIMENT RUNNER")
print("====================================================================")
print(f"Site:    {SITE}")
print(f"Project: {PROJECT}")

if API_KEY == "YOUR_API_KEY" or APP_KEY == "YOUR_APP_KEY":
    print("\n[NOTE] Please set your Datadog credentials before running experiments:")
    print('  $env:DD_API_KEY = "your_actual_datadog_api_key"')
    print('  $env:DD_APP_KEY = "your_actual_datadog_application_key"')
    print("  python datadog_eval.py\n")

LLMObs.enable(
    site=SITE,
    api_key=API_KEY,
    app_key=APP_KEY,
    project_name=PROJECT,
)

# 1. Create or pull a dataset
dataset = LLMObs.create_dataset(
    dataset_name="demo_capitals",
    description="A dataset for testing knowledge of capital cities",
    records=[
        {"input_data": "What is the capital of France?", "expected_output": "Paris"},
        {"input_data": "What is the capital of Switzerland?", "expected_output": "Bern"},
    ],
)

# 2. Define your task and evaluator(s)
def my_agent(input_data, config):
    # Replace with your agent / model / LLM calls.
    return "Paris"

def exact_match(input_data, output_data, expected_output):
    # Replace with any evaluator (e.g. LLM-as-a-judge).
    return output_data == expected_output

# 3. Define the experiment
experiment = LLMObs.experiment(
    name="demo_capitals_experiment",
    task=my_agent,
    dataset=dataset,
    evaluators=[exact_match],
    description="Testing capital cities knowledge",
    config={"model_name": "hardcoded"},
)

# 4. Run the experiment and view results in Datadog
results = experiment.run()
print("\n[SUCCESS] Experiment finished!")
print(f"Dashboard URL: {experiment.url}")
