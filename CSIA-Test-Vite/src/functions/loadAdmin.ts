import { supabase } from "../supabase-client";

function loadAdmin() { //Adds admin into database
    async function load(){
        const { data: signUpData, error: signUpDataError } =
            await supabase.auth.signUp({  }); //supabase auth
        if (signUpDataError) {
            console.error("Error signing up", signUpDataError.message);
            return;
        }

        const id = signUpData.user?.id;

        const { data: admin, error: adminError } = await supabase
                .from("Account")
                .insert([{ userId: id, email: "admin@gmail.com", name: "Admin A", role: "admin" }]);
            if (adminError) {
                console.error("Error fetching user in sign up", adminError.message);
                return;
            }
    }

    load();

}

export default loadAdmin;