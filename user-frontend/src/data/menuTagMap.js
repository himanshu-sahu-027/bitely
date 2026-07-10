const menuTagMap = [
  // menu_1 - Chicken Biryani
  { id: "mtm_1", menuId: "menu_1", tagId: "tag_nonveg" },
  { id: "mtm_2", menuId: "menu_1", tagId: "tag_spicy" },
  { id: "mtm_3", menuId: "menu_1", tagId: "tag_popular" },

  // menu_2 - Veg Biryani
  { id: "mtm_4", menuId: "menu_2", tagId: "tag_veg" },
  { id: "mtm_5", menuId: "menu_2", tagId: "tag_spicy" },
  { id: "mtm_6", menuId: "menu_2", tagId: "tag_popular" },

  // menu_3 - Paneer Butter Masala
  { id: "mtm_7", menuId: "menu_3", tagId: "tag_veg" },
  { id: "mtm_8", menuId: "menu_3", tagId: "tag_healthy" },
  { id: "mtm_9", menuId: "menu_3", tagId: "tag_chef" },

  // menu_4 - Dal Fry
  { id: "mtm_10", menuId: "menu_4", tagId: "tag_veg" },
  { id: "mtm_11", menuId: "menu_4", tagId: "tag_healthy" },
  { id: "mtm_12", menuId: "menu_4", tagId: "tag_lunch" },

  // menu_5 - Hyderabadi Chicken Biryani
  { id: "mtm_13", menuId: "menu_5", tagId: "tag_nonveg" },
  { id: "mtm_14", menuId: "menu_5", tagId: "tag_spicy" },
  { id: "mtm_15", menuId: "menu_5", tagId: "tag_popular" },

  // menu_6 - Veg Biryani
  { id: "mtm_16", menuId: "menu_6", tagId: "tag_veg" },
  { id: "mtm_17", menuId: "menu_6", tagId: "tag_spicy" },
  { id: "mtm_18", menuId: "menu_6", tagId: "tag_lunch" },

  // menu_7 - Idli Sambar
  { id: "mtm_19", menuId: "menu_7", tagId: "tag_veg" },
  { id: "mtm_20", menuId: "menu_7", tagId: "tag_breakfast" },
  { id: "mtm_21", menuId: "menu_7", tagId: "tag_jain" },

  // menu_8 - Masala Dosa
  { id: "mtm_22", menuId: "menu_8", tagId: "tag_veg" },
  { id: "mtm_23", menuId: "menu_8", tagId: "tag_breakfast" },
  { id: "mtm_24", menuId: "menu_8", tagId: "tag_popular" },

  // menu_9 - Chicken Biryani
  { id: "mtm_25", menuId: "menu_9", tagId: "tag_nonveg" },
  { id: "mtm_26", menuId: "menu_9", tagId: "tag_spicy" },
  { id: "mtm_27", menuId: "menu_9", tagId: "tag_popular" },

  // menu_10 - Hyderabadi Chicken Biryani
  { id: "mtm_28", menuId: "menu_10", tagId: "tag_nonveg" },
  { id: "mtm_29", menuId: "menu_10", tagId: "tag_spicy" },
  { id: "mtm_30", menuId: "menu_10", tagId: "tag_chef" },

  // menu_11 - Butter Chicken
  { id: "mtm_31", menuId: "menu_11", tagId: "tag_nonveg" },
  { id: "mtm_32", menuId: "menu_11", tagId: "tag_lunch" },
  { id: "mtm_33", menuId: "menu_11", tagId: "tag_chef" },

  // menu_12 - Dal Fry
  { id: "mtm_34", menuId: "menu_12", tagId: "tag_veg" },
  { id: "mtm_35", menuId: "menu_12", tagId: "tag_healthy" },
  { id: "mtm_36", menuId: "menu_12", tagId: "tag_dinner" },

  // menu_13 - Fish Fry
  { id: "mtm_37", menuId: "menu_13", tagId: "tag_nonveg" },
  { id: "mtm_38", menuId: "menu_13", tagId: "tag_spicy" },
  { id: "mtm_39", menuId: "menu_13", tagId: "tag_dinner" },

  // menu_14 - Chicken Fried Rice
  { id: "mtm_40", menuId: "menu_14", tagId: "tag_nonveg" },
  { id: "mtm_41", menuId: "menu_14", tagId: "tag_lunch" },
  { id: "mtm_42", menuId: "menu_14", tagId: "tag_combo" },

  // menu_15 - Paneer Butter Masala
  { id: "mtm_43", menuId: "menu_15", tagId: "tag_veg" },
  { id: "mtm_44", menuId: "menu_15", tagId: "tag_healthy" },
  { id: "mtm_45", menuId: "menu_15", tagId: "tag_chef" },

  // menu_16 - Dal Fry
  { id: "mtm_46", menuId: "menu_16", tagId: "tag_veg" },
  { id: "mtm_47", menuId: "menu_16", tagId: "tag_jain" },
  { id: "mtm_48", menuId: "menu_16", tagId: "tag_lunch" },

  // menu_17 - Veg Biryani
  { id: "mtm_49", menuId: "menu_17", tagId: "tag_veg" },
  { id: "mtm_50", menuId: "menu_17", tagId: "tag_spicy" },
  { id: "mtm_51", menuId: "menu_17", tagId: "tag_popular" },

  // menu_18 - Chicken Biryani
  { id: "mtm_52", menuId: "menu_18", tagId: "tag_nonveg" },
  { id: "mtm_53", menuId: "menu_18", tagId: "tag_spicy" },
  { id: "mtm_54", menuId: "menu_18", tagId: "tag_kids" },

  // menu_19 - Masala Dosa
  { id: "mtm_55", menuId: "menu_19", tagId: "tag_veg" },
  { id: "mtm_56", menuId: "menu_19", tagId: "tag_breakfast" },
  { id: "mtm_57", menuId: "menu_19", tagId: "tag_kids" },

  // menu_20 - Idli Sambar
  { id: "mtm_58", menuId: "menu_20", tagId: "tag_veg" },
  { id: "mtm_59", menuId: "menu_20", tagId: "tag_breakfast" },
  { id: "mtm_60", menuId: "menu_20", tagId: "tag_healthy" },

  // menu_21 - Hyderabadi Chicken Biryani
  { id: "mtm_61", menuId: "menu_21", tagId: "tag_nonveg" },
  { id: "mtm_62", menuId: "menu_21", tagId: "tag_spicy" },
  { id: "mtm_63", menuId: "menu_21", tagId: "tag_popular" },

  // menu_22 - Veg Biryani
  { id: "mtm_64", menuId: "menu_22", tagId: "tag_veg" },
  { id: "mtm_65", menuId: "menu_22", tagId: "tag_lunch" },
  { id: "mtm_66", menuId: "menu_22", tagId: "tag_healthy" },

  // menu_23 - Butter Chicken
  { id: "mtm_67", menuId: "menu_23", tagId: "tag_nonveg" },
  { id: "mtm_68", menuId: "menu_23", tagId: "tag_dinner" },
  { id: "mtm_69", menuId: "menu_23", tagId: "tag_chef" },

  // menu_24 - Dal Fry
  { id: "mtm_70", menuId: "menu_24", tagId: "tag_veg" },
  { id: "mtm_71", menuId: "menu_24", tagId: "tag_healthy" },
  { id: "mtm_72", menuId: "menu_24", tagId: "tag_dinner" },

  // menu_25 - Chicken Biryani
  { id: "mtm_73", menuId: "menu_25", tagId: "tag_nonveg" },
  { id: "mtm_74", menuId: "menu_25", tagId: "tag_spicy" },
  { id: "mtm_75", menuId: "menu_25", tagId: "tag_combo" },

  // menu_26 - Veg Biryani
  { id: "mtm_76", menuId: "menu_26", tagId: "tag_veg" },
  { id: "mtm_77", menuId: "menu_26", tagId: "tag_spicy" },
  { id: "mtm_78", menuId: "menu_26", tagId: "tag_popular" },

  // menu_27 - Fish Fry
  { id: "mtm_79", menuId: "menu_27", tagId: "tag_nonveg" },
  { id: "mtm_80", menuId: "menu_27", tagId: "tag_spicy" },
  { id: "mtm_81", menuId: "menu_27", tagId: "tag_dinner" },

  // menu_28 - Chicken Fried Rice
  { id: "mtm_82", menuId: "menu_28", tagId: "tag_nonveg" },
  { id: "mtm_83", menuId: "menu_28", tagId: "tag_lunch" },
  { id: "mtm_84", menuId: "menu_28", tagId: "tag_combo" },

  // menu_29 - Hyderabadi Chicken Biryani
  { id: "mtm_85", menuId: "menu_29", tagId: "tag_nonveg" },
  { id: "mtm_86", menuId: "menu_29", tagId: "tag_spicy" },
  { id: "mtm_87", menuId: "menu_29", tagId: "tag_popular" },

  // menu_30 - Chicken Biryani
  { id: "mtm_88", menuId: "menu_30", tagId: "tag_nonveg" },
  { id: "mtm_89", menuId: "menu_30", tagId: "tag_spicy" },
  { id: "mtm_90", menuId: "menu_30", tagId: "tag_chef" },

  // menu_31 - Masala Dosa
  { id: "mtm_91", menuId: "menu_31", tagId: "tag_veg" },
  { id: "mtm_92", menuId: "menu_31", tagId: "tag_breakfast" },
  { id: "mtm_93", menuId: "menu_31", tagId: "tag_kids" },

  // menu_32 - Idli Sambar
  { id: "mtm_94", menuId: "menu_32", tagId: "tag_veg" },
  { id: "mtm_95", menuId: "menu_32", tagId: "tag_breakfast" },
  { id: "mtm_96", menuId: "menu_32", tagId: "tag_jain" },

  // menu_33 - Veg Biryani
  { id: "mtm_97", menuId: "menu_33", tagId: "tag_veg" },
  { id: "mtm_98", menuId: "menu_33", tagId: "tag_spicy" },
  { id: "mtm_99", menuId: "menu_33", tagId: "tag_lunch" },

  // menu_34 - Hyderabadi Chicken Biryani
  { id: "mtm_100", menuId: "menu_34", tagId: "tag_nonveg" },
  { id: "mtm_101", menuId: "menu_34", tagId: "tag_spicy" },
  { id: "mtm_102", menuId: "menu_34", tagId: "tag_popular" },

  // menu_35 - Butter Chicken
  { id: "mtm_103", menuId: "menu_35", tagId: "tag_nonveg" },
  { id: "mtm_104", menuId: "menu_35", tagId: "tag_dinner" },
  { id: "mtm_105", menuId: "menu_35", tagId: "tag_chef" },

  // menu_36 - Paneer Butter Masala
  { id: "mtm_106", menuId: "menu_36", tagId: "tag_veg" },
  { id: "mtm_107", menuId: "menu_36", tagId: "tag_healthy" },
  { id: "mtm_108", menuId: "menu_36", tagId: "tag_lunch" },

  // menu_37 - Chicken Biryani
  { id: "mtm_109", menuId: "menu_37", tagId: "tag_nonveg" },
  { id: "mtm_110", menuId: "menu_37", tagId: "tag_spicy" },
  { id: "mtm_111", menuId: "menu_37", tagId: "tag_popular" },

  // menu_38 - Veg Biryani
  { id: "mtm_112", menuId: "menu_38", tagId: "tag_veg" },
  { id: "mtm_113", menuId: "menu_38", tagId: "tag_spicy" },
  { id: "mtm_114", menuId: "menu_38", tagId: "tag_healthy" },

  // menu_39 - Dal Fry
  { id: "mtm_115", menuId: "menu_39", tagId: "tag_veg" },
  { id: "mtm_116", menuId: "menu_39", tagId: "tag_jain" },
  { id: "mtm_117", menuId: "menu_39", tagId: "tag_lunch" },

  // menu_40 - Masala Dosa
  { id: "mtm_118", menuId: "menu_40", tagId: "tag_veg" },
  { id: "mtm_119", menuId: "menu_40", tagId: "tag_breakfast" },
  { id: "mtm_120", menuId: "menu_40", tagId: "tag_popular" },
];

export default menuTagMap;
