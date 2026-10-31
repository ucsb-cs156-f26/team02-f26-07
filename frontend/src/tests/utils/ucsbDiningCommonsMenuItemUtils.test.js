import { toast } from "react-toastify";
import { onDeleteSuccess } from "main/utils/ucsbDiningCommonsMenuItemUtils";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

describe("ucsbDiningCommonsMenuItemUtils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test("onDeleteSuccess logs and displays the message", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    onDeleteSuccess("Menu item deleted");

    expect(logSpy).toHaveBeenCalledWith("Menu item deleted");
    expect(toast).toHaveBeenCalledWith("Menu item deleted");
  });
});
