package com.chatbot.foody;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


public class ServiceCaller {
    private static boolean DEBUG = false;
    public static final int BURGERS = 12, SOUVLAKIA = 2, SANDWICH = 17;
    public static final int COFFEBRAND_MENU = 1, TOANAMMA_MENU = 87;
    private String postCode;
    private String userId;
    private int districtId;
    private List<Integer> categoryIds;
    private boolean payByCredit ;
    private int selectedRestaurantId;
    private int branchId;
    private int curFoodCategoryId;
    private int currentFoodId;
    private float curPrice;
    private int curIngredientCategoryId;
    private List<Integer> selectedFoodsIds;
    private List<Integer> selectedIngredientsId;

    private Set<Integer> selectedCategoriesIds = new HashSet<>();
    private List<Branch> matchedBranches;
    private List<Restaurant> matchedRestaurants;
    private BranchMenu selectedRestaurantMenu;
    private FoodCategory curFoodCategory;
    //private List<com.chatbot.foody.Category> selectedCategories;
    private District userDistrict;


    public String getPostCode(){
        return postCode;
    }

    private List<MenuItem> userSelectedMenuitems = new ArrayList<>();
    /**
     *
     * @return a list with the names of the categories that are currently selected.
     */
    public List<String> getCategoriesAsString(){
        ArrayList<String> categNames = new ArrayList<>();
        for(Integer c : selectedCategoriesIds ) {
            switch( c ) {
                case SANDWICH :
                    categNames.add("Sandwich");
                case SOUVLAKIA :
                    categNames.add("Souvlakia");
                case BURGERS :
                    categNames.add("Burgers");
            }
        }
        return categNames;
    }

    /**
     * Used to add category to filter restaurants and branches from.
     * If no category is chosen then all restaurants and branches are selected (based on other criteria).
     * @param categoryId the category id.
     */
    void addCategory(int categoryId) {
        selectedCategoriesIds.add(categoryId);
    }

    /**
     * Used to remove category to filter restaurants and branches from.
     * If no category is chosen then all restaurants and branches are selected (based on other criteria).
     * @param categoryId the category id.
     */
    void removeCategory(int categoryId) {
        selectedCategoriesIds.remove(categoryId);
    }

    /**
     *
     * @param branchId the id of the branch
     */
    void setSelectedRestaurant(int branchId) {
        this.selectedRestaurantId = branchId;
        String jsonString = "";
        switch ( selectedRestaurantId ) {
            case TOANAMMA_MENU :
                    jsonString = FileParser.getFileContentAsString("sample-dataset/restaurant_menu/to-anamma_menu.json");
                    break;
            case COFFEBRAND_MENU :
                    jsonString = FileParser.getFileContentAsString("sample-dataset/restaurant_menu/coffeebrands_menu.json");
                    break;
            default:
                throw new NoSuchBranchIdException(branchId);
        }
        this.selectedRestaurantMenu = new BranchMenu(new JSONObject(jsonString));
    }
    /**
     *
     * @return a list the the category ids of the currently selected categories.
     */
    public List<Integer> getCatorgoriesIds(){
        ArrayList<Integer> categIds = new ArrayList<>();
        categIds.addAll(categIds);
        return categIds;
    }

    public  String getDistrictAsString(){

        return userDistrict.getSlug() ;

    }

    public  int getDistrictId() {

        return userDistrict.getId();

    }

    public  District getUserDistrict(){

        return userDistrict;

    }

    /**
     * Set the pay by credit.
     * @param payByCredit whether the user will pay by credit or not.
     */
    public  void setPayByCredit(boolean payByCredit){
        this.payByCredit = payByCredit;
    }

    /**
     * Returns matching restaurants based on district, postal code and selected categories.
     * @return a list of Restaurants
     */
     List<Restaurant> getMatchingRestaurants() {
        ArrayList<Branch> matchedBranches = new ArrayList<>();
        //RestaurantId  is saved
        List<Integer> restaurantIds = new ArrayList<>();
        List<Restaurant> matchedRestaurants = new ArrayList<>();

        String jsonString = "";
        //If no category is set then return all restaurants.
        if(selectedCategoriesIds.isEmpty()) {
            jsonString = FileParser.getFileContentAsString("sample-dataset/general/restaurants.json");
            JSONArray jsonArray = new JSONArray(jsonString);
            //create com.chatbot.foody.Branch for each json object in jsonArray
            if(DEBUG)
                System.out.println("The json of the first json object in the array is \n" + jsonArray.optJSONObject(0).toString(4));
            for(int i = 0; i < jsonArray.length(); i++) {
                Branch curBranch = new Branch(jsonArray.optJSONObject(i));
                matchedBranches.add(curBranch);
                if(DEBUG)
                    System.out.println("The first com.chatbot.foody.Branch object is \n" + curBranch);
                Restaurant restaurant = new Restaurant(curBranch.getJson().optJSONObject("restaurant"));

                int restaurantId = restaurant.getId();
                boolean isRestaurantAlreadyInList = restaurantIds.contains(restaurantId);
                if(!isRestaurantAlreadyInList) {
                    matchedRestaurants.add(restaurant);
                    restaurantIds.add(restaurantId);
                }
            }
        }

        //The json Array has json representation of branches
        for(Integer categoryId : selectedCategoriesIds) {
            switch (categoryId) {
                case SANDWICH:
                    jsonString = FileParser.getFileContentAsString("sample-dataset/restaurants_by_category/sandwich.json");
                    break;
                case SOUVLAKIA:
                    jsonString = FileParser.getFileContentAsString("sample-dataset/restaurants_by_category/souvlakia.json");
                    break;
                case BURGERS:
                    jsonString = FileParser.getFileContentAsString("sample-dataset/restaurants_by_category/burgers.json");
                    break;
            }

            JSONArray jsonArray = new JSONArray(jsonString);
            //create com.chatbot.foody.Branch for each json object in jsonArray
            if(DEBUG)
                System.out.println("The json of the first json object in the array is \n" + jsonArray.optJSONObject(0).toString(4));
            for(int i = 0; i < jsonArray.length(); i++) {
                Branch curBranch = new Branch(jsonArray.optJSONObject(i));
                matchedBranches.add(curBranch);
                if(DEBUG)
                    System.out.println("The first com.chatbot.foody.Branch object is \n" + curBranch);
                Restaurant restaurant = new Restaurant(curBranch.getJson().optJSONObject("restaurant"));

                int restaurantId = restaurant.getId();
                boolean isRestaurantAlreadyInList = restaurantIds.contains(restaurantId);
                if(!isRestaurantAlreadyInList) {
                    matchedRestaurants.add(restaurant);
                    restaurantIds.add(restaurantId);
                }
            }
        }

        this.matchedBranches = matchedBranches;
        this.matchedRestaurants = matchedRestaurants;
        return matchedRestaurants;
    }

    public  List<MenuItem> getFoodFromFoodCategory() throws FoodCategoryIsNotSetException{
        if(curFoodCategory == null)
            throw new FoodCategoryIsNotSetException();
        return null;
    }

    /**
     *
     * @return the food categories of the selectedBranchMenu.
     */
    public  List<FoodCategory> getBranchFoodCategories(){
        return selectedRestaurantMenu.getFoodCategories();
    }


    /**
     *
     * @return the com.chatbot.foody.Branch Menu with the delivery information.
     */
    public  BranchMenu getBranchDeliveryInfo(){

        return selectedRestaurantMenu;
    }

    //TODO implement logic
    public List<IngredientCategory> getIngredientCategoriesForFood(MenuItem menuItems){
        return menuItems.getIngredientCategory();
    }

    //TODO implement logic
    public List<Ingredient> getIngredientsForIngredientCategory(Ingredient i){
        return null;
    }

    //TODO implement logic
    private int calculateBranchId(){
        return 0;
    }


    void addMenuItemToOrder(MenuItem mi ) {
        userSelectedMenuitems.add(mi);
    }
    /**
     *
     * @return the com.chatbot.foody.BranchMenu of the selected com.chatbot.foody.Restaurant.
     */
    BranchMenu getSelectedRestaurantMenu() {
         return selectedRestaurantMenu;
    }
    public static void main(String args[]) throws FileNotFoundException {
        PrintStream out = new PrintStream(new FileOutputStream("log-output/output.txt"));
        System.setOut(out);
        ServiceCaller sc = new ServiceCaller();

        sc.addCategory(ServiceCaller.BURGERS);
        List<Restaurant> restaurantList = sc.getMatchingRestaurants();
        System.out.println("Burger Restaurants found:");
        for(Restaurant r : restaurantList) {
            System.out.println(r);
        }

        System.out.println("Number of restaurants found after adding burger category " + sc.getMatchingRestaurants().size() );
        sc.addCategory(ServiceCaller.SANDWICH);
        System.out.println("Number of restaurants found after adding sandwich category " +   sc.getMatchingRestaurants().size() );
        sc.removeCategory(ServiceCaller.SANDWICH);
        System.out.println("Number of restaurants found after removing sandwich category " +  sc.getMatchingRestaurants().size()  );
    }
}
