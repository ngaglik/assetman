import { defineComponent, h } from "vue";
import type { DropdownOption } from "naive-ui";
import { PersonCircleOutline, LogOutOutline } from "@vicons/ionicons5";
import { getAuthData } from "@/services/authService";

export default defineComponent({
  name: "ProfileBar",
  components: { PersonCircleOutline },
  emits: ["logout"],
  setup(_, { emit }) {
    const auth = getAuthData();
    const employee = auth?.employee ?? {};
    const userName =
      employee.personName ??
      employee.PersonName ??
      employee.person_name ??
      "Pengguna";

    const options: DropdownOption[] = [
      {
        label: "Logout",
        key: "logout",
        icon: () => h(LogOutOutline),
      },
    ];

    const handleSelect = (key: string) => {
      if (key === "logout") emit("logout");
    };

    return { userName, options, handleSelect };
  },
});
